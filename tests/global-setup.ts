import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create({
    binary: {
      version: "7.0.14",
    },
  });

  // The workers are forked after this hook, so they inherit the env var.
  process.env.TEST_MONGO_URI = mongod.getUri();

  (globalThis as any).__MONGOD__ = mongod;
}
