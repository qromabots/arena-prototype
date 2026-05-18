# Getting Started

This guide walks you through setting up a machine to work on **arena-prototype** and make
your first commit. It assumes you're newer to programming, so it explains each step rather
than just listing commands. If you've done some of this before, skip ahead.

The steps work on **macOS, Windows, and Linux**. Where a command or detail differs by
operating system, the difference is called out.

---

## 1. The tools you need

You'll install four things. Each one is explained below.

| Tool | What it is | Why this repo needs it |
|------|------------|------------------------|
| **A terminal** | A text-based way to run commands | You'll type every command below into it |
| **Git** | Tracks changes to code over time | This repo *is* a Git repository |
| **Node.js** (includes npm) | Runs JavaScript outside the browser, and installs code libraries | Builds and serves the app |
| **A code editor** | Where you read and write code | VS Code is recommended |

---

## 2. Open a terminal

A terminal is an app where you type commands and press Enter to run them.

- **macOS** — open the **Terminal** app (press `Cmd + Space`, type `Terminal`, Enter).
- **Windows** — open **Windows Terminal** or **PowerShell** from the Start menu.
- **Linux** — open your distribution's terminal app (often `Ctrl + Alt + T`).

Throughout this guide, lines in code blocks are commands — type them in and press Enter.
You do **not** type the `$` if you see one; it just represents the prompt.

---

## 3. Install Git

Git is the system that records every change made to the code. Check whether it's already
installed:

```
git --version
```

If you see a version number, skip to the configuration step below. If you see an error,
install Git:

- **All platforms** — download the installer from <https://git-scm.com/downloads> and run
  it. The default options are fine.
- Or, if you already use a package manager: `brew install git` (macOS Homebrew),
  `winget install Git.Git` (Windows), `sudo apt install git` (Debian/Ubuntu Linux).

Then tell Git who you are — this name and email get attached to every commit you make:

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

## 4. Install Node.js

Node.js runs the build tools for this project. It also includes **npm** ("Node Package
Manager"), which downloads the libraries this project depends on — installing Node.js
gives you both.

This project requires **Node 24 or newer** — that requirement is declared in
`package.json` (the `engines` field) and enforced by `.npmrc`, so `npm install` will stop
with an error if your Node version is too old. Download the **LTS** installer for your
operating system from <https://nodejs.org/en/download> and run it with the default
options.

(If you prefer a version manager, [`nvm`](https://github.com/nvm-sh/nvm) on macOS/Linux or
[`nvm-windows`](https://github.com/coreybutler/nvm-windows) on Windows works too — then
`nvm install 24`.)

Check the versions, reopening your terminal first so it picks up the new tool:

```
node --version
npm --version
```

`node` should print `v24.x.x` (or higher) and `npm` should print a version number.

---

## 5. Install a code editor

[Visual Studio Code](https://code.visualstudio.com/) (VS Code) is a free, widely used
editor that works well with this project's stack (TypeScript and React). Download it for
your operating system from that link and install it.

---

## 6. Get the code

Pick a folder to keep projects in and "clone" (download) the repository into it. If the
repo already exists on this machine, you can skip the clone and just `cd` into it.

```
cd ~/Projects
git clone <repository-url>
cd arena-prototype
```

Replace `<repository-url>` with the URL from the repo's host (for example, the green
"Code" button on GitHub). `cd` means "change directory" — it moves you into that folder so
later commands act on the project. On Windows, use a path like `cd %USERPROFILE%\Projects`
if `~/Projects` isn't recognized.

Open the project in VS Code:

```
code .
```

(The `.` means "the current folder." If `code` isn't recognized, open VS Code, press
`Cmd/Ctrl + Shift + P`, and run "Shell Command: Install 'code' command in PATH".)

---

## 7. Install the project's dependencies

The project relies on outside libraries (React, Vite, TinyBase, and more). They aren't
stored in the repo — you download them with one command, run from inside the project
folder:

```
npm install
```

This reads `package.json` and `package-lock.json`, then creates a `node_modules/` folder
with everything. It can take a minute or two. You only need to rerun it when the
dependency list changes (for example, after pulling in someone else's updates).

> **Note:** `node_modules/` is intentionally *not* committed to Git — the `.gitignore`
> file excludes it. That's expected; everyone regenerates it with `npm install`.

This repo is an npm **workspace**: the actual app lives in `platform/web` and shared code
in `platform/shared-types`. Running `npm install` once at the top level installs
dependencies for all of them — you don't install them separately.

---

## 8. Run the app

Start the local development server from the top-level project folder:

```
npm run dev
```

This builds the app and serves it locally. The terminal will print a URL such as
`http://localhost:5173` — open it in your browser to see the app. As you edit files, the
page reloads automatically.

Press `Ctrl + C` in the terminal to stop the server.

Two other useful commands:

```
npm run typecheck   # checks the code for type errors without running it
npm run build       # produces a production build in platform/web/dist
```

Run `npm run typecheck` before committing — it catches mistakes early.

---

## 9. Make a change and commit it

Git work happens in small saved steps called **commits**. Here's the typical loop.

**a. Start from an up-to-date `main` and create a branch.** A branch is a separate line of
work, so you don't change `main` directly:

```
git checkout main
git pull
git checkout -b my-change-name
```

Name the branch for what you're doing, e.g. `fix-join-button`.

**b. Edit files** in VS Code. Save with `Cmd + S` (macOS) or `Ctrl + S` (Windows/Linux).

**c. See what you changed:**

```
git status     # which files changed
git diff        # the exact line-by-line changes
```

**d. Stage and commit.** Staging picks which changes go into the commit; committing saves
them with a message:

```
git add .
git commit -m "Short description of what you changed"
```

`git add .` stages every changed file. The message should briefly explain *what* and
*why*.

**e. Push the branch** to share it:

```
git push -u origin my-change-name
```

The `-u origin my-change-name` part is only needed the first time you push a new branch;
after that, plain `git push` works. From there you'd typically open a **pull request** on
the repo's host so others can review the change before it joins `main`.

---

## Troubleshooting

- **"command not found"** right after installing something — close and reopen the
  terminal so it picks up the new tool, then try again.
- **`npm install` fails** — make sure you're inside the `arena-prototype` folder
  (run `pwd` to check, or `cd` on Windows). If the error mentions `engine` or a Node
  version, your Node is too old — install v24 or higher (see step 4).
- **The dev server won't start / port in use** — another copy may still be running. Stop
  it with `Ctrl + C`, or close other terminals running `npm run dev`.
- **Type errors after pulling new code** — run `npm install` again; the dependency list
  may have changed.

---

## Where to go next

- `README.md` — what the project is and how it's architected.
- `plan-archives/INITIAL-PLAN.md` — the full infrastructure plan.
- `platform/web/src/` — the app's source code (pages, components, router).
- `platform/shared-types/src/` — shared TypeScript types used across the project.
