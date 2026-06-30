import {createClient} from "@azeljkovic/lighty";

export const client = createClient({
  baseUrl: "http://localhost",
  timeoutMs: 5_000,
  throwOnHttpError: false,
  logger: "verbose",
});
