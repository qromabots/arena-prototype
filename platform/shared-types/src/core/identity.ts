import { zSigningPrivKeyJwk, zSigningPubKeyBytes } from './keys.js';
import { PREFIX, zPlayerId, type PlayerId } from './ids.js';
import {
  zHandle,
  zPlayerIdentity,
  type Handle,
  type PlayerIdentity,
  type StoredIdentity,
} from './schemas.js';

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function derivePlayerId(pubKeyBytes: string): PlayerId {
  const parsed = zSigningPubKeyBytes.parse(pubKeyBytes);
  return zPlayerId.parse(`${PREFIX.player}_${parsed}`);
}

export async function exportSigningPubKeyBytes(
  publicKey: CryptoKey,
): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', publicKey));
  return zSigningPubKeyBytes.parse(bytesToBase64Url(raw));
}

export async function generateKeypair(): Promise<{
  playerId: PlayerId;
  signingPubKey: string;
  signingPrivKey: string;
  avatarColor: string;
}> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify'],
  );

  const signingPubKey = await exportSigningPubKeyBytes(keyPair.publicKey);
  const privJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
  const signingPrivKey = zSigningPrivKeyJwk.parse(JSON.stringify(privJwk));
  const playerId = derivePlayerId(signingPubKey);
  const avatarColor = randomAvatarColor();

  return { playerId, signingPubKey, signingPrivKey, avatarColor };
}

export function randomAvatarColor(): string {
  const hues = [200, 260, 320, 20, 140, 180];
  const hue = hues[Math.floor(Math.random() * hues.length)] ?? 200;
  return `hsl(${hue} 55% 48%)`;
}

export function hasCompleteIdentity(
  stored: StoredIdentity | null | undefined,
): stored is StoredIdentity & { handle: Handle } {
  if (!stored) return false;
  return zHandle.safeParse(stored.handle).success;
}

export function toPlayerIdentity(stored: StoredIdentity): PlayerIdentity {
  return zPlayerIdentity.parse({
    playerId: stored.playerId,
    signingPubKey: stored.signingPubKey,
    signingPrivKey: stored.signingPrivKey,
    handle: stored.handle,
    avatarColor: stored.avatarColor,
  });
}

export async function signChallenge(
  nonce: string,
  privKeyJwk: string,
): Promise<string> {
  const jwk = JSON.parse(privKeyJwk) as JsonWebKey;
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'Ed25519' },
    false,
    ['sign'],
  );
  const data = new TextEncoder().encode(nonce);
  const sig = new Uint8Array(await crypto.subtle.sign('Ed25519', privateKey, data));
  return bytesToBase64Url(sig);
}

export async function verifySignature(
  nonce: string,
  signature: string,
  pubKeyBytes: string,
): Promise<boolean> {
  const raw = base64UrlToBytes(pubKeyBytes);
  const publicKey = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(raw),
    { name: 'Ed25519' },
    false,
    ['verify'],
  );
  const data = new TextEncoder().encode(nonce);
  const sig = base64UrlToBytes(signature);
  return crypto.subtle.verify('Ed25519', publicKey, new Uint8Array(sig), data);
}
