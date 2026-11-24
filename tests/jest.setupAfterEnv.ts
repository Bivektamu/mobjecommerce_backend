import mongoose from "mongoose";

const DB_NAME_PREFIX = "ecommerce_test";

async function clearDatabase() {
  if (!mongoose.connection.db) {
    return;
  }
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

// Runs in each worker process once per test file. Every worker gets its own
// database so parallel files never share data, and every test starts from an
// empty database so files do not depend on each other or on run order.

beforeAll(async () => {
  const uri = process.env.TEST_MONGO_URI;
  if (!uri) {
    throw new Error("TEST_MONGO_URI is not set. The global setup may have failed.");
  }
  const workerId = process.env.JEST_WORKER_ID ?? "1";
  await mongoose.connect(uri, {
    dbName: `${DB_NAME_PREFIX}_${workerId}`,
    // Indexes are not auto built in production. The User schema marks googleId
    // unique, which rejects every user without a googleId once that index is
    // built. Mirroring production keeps the suite honest about that schema
    // quirk until the data layer restructure fixes it.
    autoIndex: false,
  });
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});
