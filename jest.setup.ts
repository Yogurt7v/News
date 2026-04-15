/* eslint-disable @typescript-eslint/no-require-imports */
import '@testing-library/jest-dom';

const {
  TextEncoder: NodeTextEncoder,
  TextDecoder: NodeTextDecoder,
} = require('util');

(globalThis as unknown as Record<string, unknown>).TextEncoder =
  NodeTextEncoder;
(globalThis as unknown as Record<string, unknown>).TextDecoder =
  NodeTextDecoder;

const { Response, Request, Headers, fetch: originalFetch } = globalThis;

(globalThis as unknown as Record<string, unknown>).Response = Response;
(globalThis as unknown as Record<string, unknown>).Request = Request;
(globalThis as unknown as Record<string, unknown>).Headers = Headers;

globalThis.fetch = originalFetch;
