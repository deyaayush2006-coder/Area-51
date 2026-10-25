const mongoose = require("mongoose");
const dns = require("dns");

// Force Node to resolve DNS (including Atlas's SRV records) via Google's public
// resolver. Works around ISPs/routers that block or mishandle SRV lookups, which is
// the most common cause of "querySrv ECONNREFUSED" when connecting to Atlas.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Serverless functions can be invoked many times concurrently and get "frozen"
// between requests. Without caching, every cold start would open a brand new
// connection to MongoDB Atlas and you'd quickly exhaust your connection pool.
// Caching on `global` lets a warm container reuse its existing connection
// instead of reconnecting on every invocation.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in your .env file");
    }

    if (!cached.promise) {
      cached.promise = mongoose.connect(uri, { maxPoolSize: 10 });
    }

    cached.conn = await cached.promise;
    console.log("MongoDB connected successfully");
    return cached.conn;
  } catch (error) {
    // Reset so the next invocation/request retries instead of reusing a failed promise.
    cached.promise = null;

    // Log and keep the Express server alive instead of killing the whole process.
    // This means routes stay reachable (so you can see clear "DB not connected"
    // errors in the browser/Network tab) instead of the server silently dying
    // right after printing "Server running on port ...".
    console.error("MongoDB connection failed:", error.message);
    console.error("Database-dependent routes will fail until this is fixed.");
  }
};

module.exports = connectDB;
