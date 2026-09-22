import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI)
  throw new Error("Please define the MONGODB_URI environment variable");

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached =
  global.mongooseCache ||
  (global.mongooseCache = { conn: null, promise: null });

/**
 * Returns the cached Mongoose connection, sharing an in-flight connection
 * attempt across callers. A failed attempt is cleared so a later call can retry.
 *
 * @throws The error reported by Mongoose when the connection cannot be opened.
 */
export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(
      "MongoDB connection error. Please make sure MongoDB is running. " + e,
    );
    throw e;
  }

  console.info("Connected to MongoDB");
  return cached.conn;
};