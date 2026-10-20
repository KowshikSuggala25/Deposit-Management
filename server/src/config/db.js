const mongoose = require("mongoose");
const dns = require("dns");

const globalForMongoose = global;

if (!globalForMongoose.__mongoConnectionPromise) {
  globalForMongoose.__mongoConnectionPromise = null;
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (globalForMongoose.__mongoConnectionPromise) {
    return globalForMongoose.__mongoConnectionPromise;
  }

  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not configured.");
  }

  const dnsServers = process.env.DNS_SERVERS
    ?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers?.length) {
    dns.setServers(dnsServers);
  }

  globalForMongoose.__mongoConnectionPromise = mongoose
    .connect(mongoURI)
    .then(() => mongoose.connection)
    .catch((error) => {
      globalForMongoose.__mongoConnectionPromise = null;
      throw error;
    });

  return globalForMongoose.__mongoConnectionPromise;
};

module.exports = connectDB;
