import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { restHandlers } from "./mocks/handlers";

const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());
