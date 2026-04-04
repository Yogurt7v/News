import '@testing-library/jest-dom';

const {
  TextEncoder: NodeTextEncoder,
  TextDecoder: NodeTextDecoder,
} = require('util');

globalThis.TextEncoder = NodeTextEncoder;
globalThis.TextDecoder = NodeTextDecoder;

const { Response, Request, Headers, fetch: originalFetch } = globalThis;

globalThis.Response = Response;
globalThis.Request = Request;
globalThis.Headers = Headers;

globalThis.fetch = originalFetch;
