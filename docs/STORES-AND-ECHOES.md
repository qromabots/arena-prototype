# Stores and Echoes

> The data model of an arena is **one shared TinyBase store**. But "shared" hides a
> distinction this project leans on: there is exactly one copy that is the **source of
> truth**, and every other copy is a **mirror that defers to a source**. We name the
> first **the store** and the second **an echo**. This doc defines the two terms, shows
> why the relationship is *transitive*, and explains how the same distinction looks from
> TinyBase, from the Durable Object transport, and from Trystero P2P.
>
> *Echo* is the **working name, not locked in.** It captures the two things that matter
> most — an echo is a faithful return of a source, and it arrives **later and fainter the
> further it travels**, which is the staleness model baked into the word. Other terms
> considered, if we revisit: **view** (database-precise — a non-authoritative derived
> read), **reflection**, **mirror**, **replica**. If the name changes, it changes
> everywhere; nothing in the code depends on it yet.

---

## Two words, on purpose

| Term | What it is | Who holds it | Authority |
|---|---|---|---|
| **The store** | The authoritative copy of an arena's data. | The **host** — the user who created the arena and operates it. | Source of truth. Its writes to the regions it owns are canonical. |
| **An echo** | A copy that mirrors a store it is relayed from. | Any non-host participant. | Defers to a source. It *owns* only its own slice; everything else is a faithful, eventually-consistent return of what it heard. |

The everyday word is "store" for both — TinyBase only knows about stores, and every
browser in an arena holds a `MergeableStore`. The reason we split the vocabulary is that
the *role* differs:

- **The store** is hosted. The host writes the `arena` region; that is the truth.
- **An echo** is **relayed**. The holder did not originate most of what it contains — it
  received it from a source and acknowledges that source as more authoritative than its
  own return of it.

An echo is not a worse store. It is a store that **voluntarily restricts its own writes
to the regions it owns** (per the good-citizen ownership convention in
[`platform/shared-types/src/core/store-ownership.ts`](../platform/shared-types/src/core/store-ownership.ts))
and echoes everything else from the source it acknowledges.

---

## The acknowledgment is transitive

An echo acknowledges *a source*, not necessarily *the source*. Sources can chain — an
echo of an echo.

```
  Alice ───hosts──▶  ┌─────────────────┐
                     │   THE STORE     │   ← source of truth (the arena)
                     └────────┬────────┘
                              │ relay
                              ▼
  Bob   ───holds──▶  ┌─────────────────┐
                     │ an echo         │   ← echoes Alice; Bob's source = Alice
                     │ (of Alice)      │
                     └────────┬────────┘
                              │ relay
                              ▼
  Charlie ─holds──▶  ┌─────────────────┐
                     │ an echo         │   ← echoes Bob; Charlie's source = Bob
                     │ (of Bob's echo) │      (and, transitively, Alice)
                     └─────────────────┘
```

- **Alice** hosts. She owns the `arena` region; her copy is *the store*.
- **Bob** echoes Alice. His copy is *an echo of Alice's store*. Bob's source of truth is
  Alice.
- **Charlie** echoes **Bob**, not Alice. His copy is *an echo of Bob's echo*. Charlie's
  immediate source is Bob; Bob's is Alice. Charlie's view is therefore truth-*about*-
  Alice, **as relayed through Bob.**

Each arrow is one acknowledgment: *"I treat the node above me as more authoritative than
my own return of it."* The chain of acknowledgments — not any single hub — is what makes
Charlie's echo ultimately trace back to Alice's store.

**What chaining costs.** Like a real echo, each relay hop adds delay and a window for
staleness — later and fainter the further it travels. If Bob is behind, Charlie is at
least as behind. If Bob drops, Charlie's source of truth is gone until he re-acknowledges
another node (e.g. Alice directly, or another peer who still echoes Alice). Per the
project's **fail-brittle** principle, an echo that loses its source should surface that
plainly, not silently pretend its last return is current.

---

## How TinyBase sees it: stores merging, no "source"

TinyBase has **no concept of source vs echo.** Every participant holds a `MergeableStore`,
and a synchronizer reconciles pairs of them. Merges are a CRDT — commutative, associative,
idempotent, ordered by hybrid logical clocks — so any two stores that exchange deltas
**converge to the same state regardless of who sent what to whom.** Direction does not
matter to the merge.

That symmetry is exactly why we need our own vocabulary on top:

> From TinyBase's angle, **stores are being shared.** "The store" vs "an echo" is an
> **application-level authority overlay**, not something the CRDT enforces.

The overlay is the good-citizen ownership convention:

| Region | Written by | Everyone else |
|---|---|---|
| `arena` | the host | read-only |
| a player's own `players` row | that player | read-only |
| a player's own `messages` (`from === self`) | that player | read; consume rows where `to === self` |
| a player's own `intents` (`from === self`) | that player | host reads and consumes |

An **echo** is a `MergeableStore` that honors this convention: it writes *only* the
regions it owns and treats the rest as a read-only return of its source. Because the CRDT
would happily accept a write to `arena` from anyone, the distinction lives in
**discipline**, not in the transport. (Cryptographic enforcement — rejecting writes to
regions you don't own — is a later hardening step; v1 trusts invited, good-citizen
participants.)

### TinyBase can be P2P too — by republishing

Don't read "TinyBase" as "hub-and-spoke" and "Trystero" as "mesh." That mapping is a
convenience of *today's* wiring, not a property of the libraries. TinyBase is equally
capable of P2P relay chains: a node simply has to **republish** a store it is echoing.

A `MergeableStore` can run more than one synchronizer at once. So a single browser can be
a sync *client* toward its source **and** a sync *server* toward other nodes at the same
time — it consumes the store from above and re-serves it below. The moment it does, the
node downstream is an **echo of an echo**, and we are back in the transitive chain *even
on TinyBase*, with no Durable Object and no Trystero involved.

> The relay chain comes from **republishing**, not from the transport. Trystero just makes
> republishing the default (every peer relays); the DO just makes it unnecessary (one hub
> relays for everyone). TinyBase sits underneath both and can do either.

So "the store vs an echo" and "how deep the chain goes" are decided by **who republishes
to whom**, independent of which library moves the bytes.

---

## How the two transports realize the relationship

The arena pins **one** transport in its share URL (`?t=do` or `?t=p2p`); the store / echo
model is the same in both, but the **relay topology** differs *today* — and, per the note
above, that difference is in how each is wired (who republishes to whom), not a limit of
the transport itself.

### `do` — Cloudflare Durable Object: a hub that *is* the canonical relay

```
        Alice ─┐
               ├─ ws ─▶ ┌────────────────────────┐
        Bob ───┤        │  DrawingRoom / ArenaDO  │  ← the relay holds a
               │        │  (MergeableStore +      │    persisted copy
        Charlie┘        │   storage persister)    │
                        └────────────────────────┘
```

In the DO transport (today's drawing + gamepad demos —
[`platform/edge/src/index.ts`](../platform/edge/src/index.ts)), the Durable Object runs a
`WsServerDurableObject` and persists its own `MergeableStore`. Topology is
**hub-and-spoke**: everyone syncs with the DO, not with each other. So there is no Bob→
Charlie chain — every participant is *one hop* from a single relay that holds the
canonical, persisted copy.

In this shape, "the store" has a convenient physical home: the DO's persisted copy
outlives any individual browser, and the host's authority over the `arena` region is the
*only* asymmetry. Transitivity collapses to depth 1: everyone is an echo *of the DO*,
which is an echo *of the host* for the regions the host owns.

### `p2p` — Trystero: echoes over a mesh, sources acknowledged per edge

```
        Alice ◀───────▶ Bob ◀───────▶ Charlie
          ▲                              │
          └──────────────(maybe)─────────┘
```

In the P2P transport there is **no hub and no persisted canonical copy** — only peers
exchanging deltas directly. From Trystero's angle:

> **Echoes are shared peer-to-peer**, and peers **acknowledge other peers as sources of
> truth.**

This is where transitivity is real. Charlie may be connected to Bob but not (yet) to
Alice; he receives Alice's truth *through* Bob and acknowledges Bob as his source. The
mesh can form relay chains, partition, and re-form. The CRDT guarantees that once deltas
propagate along *any* path, every reachable peer converges — but **until they do**, an
echo at the far end of a chain is an echo of an echo, and "source of truth" is a per-edge
acknowledgment rather than a single address.

The host is still distinguished by the **authority overlay** (only Alice writes `arena`),
not by topology. In a pure mesh, if the host disconnects, the arena's `arena` region has
no live writer — it freezes at its last value until the host returns. (See open
questions.)

---

## What this means concretely in this repo

The demos already exercise the model, even before the `ArenaStore` interface
([`platform/shared-types/src/core/store.ts`](../platform/shared-types/src/core/store.ts))
is implemented:

- **Gamepad sync** ([`platform/web/src/gamepad/`](../platform/web/src/gamepad/)) — each
  browser writes **only its own** `controllers` row (keyed by `playerId`) every animation
  frame and echoes everyone else's. That is the ownership convention in miniature: *write
  the region you own (your controller), return the rest.* Every participant's view of the
  others is an **echo**; nobody is authoritative over another's input.
- **Drawing sync** ([`platform/web/src/drawing/`](../platform/web/src/drawing/)) — a
  shared canvas where the DO holds the persisted store and each browser holds an echo of
  it.

The not-yet-built **arena** generalizes this: one shared store with `arena` + `players` +
`controllers` (+ later `messages` / `intents`) tables, the host authoritative over
`arena`, each player authoritative over their own rows, everyone else echoing — *a store
at the host, an echo everywhere else.*

---

## Divergence, reconnection, and trust

- **Convergence is eventual, not instant.** An echo is always *some* amount behind its
  source; the deeper in a relay chain, the more behind. Treat an echo as a recent return,
  never a live wire.
- **A lost source must be visible.** When an echo can no longer reach its source (DO
  socket dropped, peer left the mesh), it should enter a clearly-signalled
  disconnected/stale state rather than presenting old data as current — **fail brittle.**
- **Authority is convention, not enforcement (v1).** Nothing in the CRDT stops an echo
  from writing `arena`. We rely on invited, good-citizen participants. Cryptographic
  challenge-response that rejects writes outside your owned regions — turning the
  good-citizen convention into an enforced one — is a deliberate later step.

---

## Glossary

- **The store** — the authoritative copy of an arena, hosted by its creator; source of
  truth for the regions the host owns.
- **An echo** — a copy that mirrors a store relayed from a source it acknowledges;
  authoritative only over its own owned regions.
- **Source of truth** — for a given echo, the node it acknowledges as more authoritative
  than itself; may be the store directly or another echo (transitive).
- **Region / ownership** — the slice of the shared store a participant is permitted (by
  convention) to write; see `store-ownership.ts`.
- **Relay topology** — *how* copies reach each other (DO hub-and-spoke vs Trystero mesh);
  independent of the authority overlay.

---

## Open questions

- ❓ In a `p2p` mesh, who (if anyone) backstops the `arena` region while the host is
  briefly gone — a designated successor, a frozen-until-return policy, or hard pause?
- ❓ Does an echo ever *re-home* its source automatically (e.g. Charlie switching from Bob
  to Alice when a shorter path opens), and how is that surfaced?
- ❓ How deep should relay chains be allowed to get before staleness is unacceptable for
  real-time control input?
- ❓ When ownership becomes enforced, does enforcement live at each peer (verify
  signatures on incoming deltas) or only at the host/DO?
