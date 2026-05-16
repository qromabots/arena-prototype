import { z } from 'zod';

export const zSigningPubKeyBytes = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/, 'Invalid SigningPubKeyBytes')
  .brand<'SigningPubKeyBytes'>();
export type SigningPubKeyBytes = z.infer<typeof zSigningPubKeyBytes>;

export const zSigningPrivKeyJwk = z
  .string()
  .min(1)
  .brand<'SigningPrivKeyJwk'>();
export type SigningPrivKeyJwk = z.infer<typeof zSigningPrivKeyJwk>;
