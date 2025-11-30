const mongoose = require("mongoose");

const DB_ACCESS = process.env.DB_URL;

// Cache de conexión para entornos serverless (Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Si ya tenemos una conexión cacheada, la reutilizamos
  if (cached.conn) {
    console.log("Usando conexión MongoDB cacheada");
    return cached.conn;
  }

  // Si no hay una promesa de conexión en curso, la creamos
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Deshabilita buffering para serverless
      maxPoolSize: 10, // Limita conexiones en el pool
    };

    mongoose.set("strictQuery", true);
    
    cached.promise = mongoose.connect(DB_ACCESS, opts).then((mongoose) => {
      console.log("Nueva conexión MongoDB establecida en host:", mongoose.connection.host);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Resetea la promesa si falla
    console.log("No se puede conectar a la base de datos ->>", error);
    throw error;
  }

  return cached.conn;
};

module.exports = { connectDB };
