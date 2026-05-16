import { z } from 'zod';

/** @deprecated Prefer z.brand() on schemas; kept for generic utilities. */
export type Brand<T, B extends string> = T & z.BRAND<B>;
