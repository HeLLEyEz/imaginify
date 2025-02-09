import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Declare a global interface to extend the NodeJS.Global interface
declare global {
  var mongoose: { 
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

let cached: MongooseConnection = global.mongoose || {
  conn: null,
  promise: null
};

if (!global.mongoose) {
  global.mongoose = cached;
}

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) {
    throw new Error('Missing MONGODB_URL environment variable');
  }

  cached.promise = 
    cached.promise || 
    mongoose.connect(MONGODB_URL, { 
      dbName: 'imaginify',
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
    });

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
  }

  return cached.conn;
}

export const disconnectFromDatabase = async (): Promise<void> => {
  if (!cached.conn) return;
  
  await cached.conn.disconnect();
  cached.conn = null;
  cached.promise = null;
}