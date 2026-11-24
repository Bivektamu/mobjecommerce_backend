import "dotenv/config";

import connectDB from "../dataLayer";
import { createServer } from "./app";

async function startServer() {
  await connectDB();

  const { httpServer } = await createServer();

  await new Promise<void>((resolve) => httpServer.listen({ port: 3000 }, resolve));
  console.log(`🚀 Server is ready.`);
}

startServer();
