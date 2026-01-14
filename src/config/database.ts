import mongoose from "mongoose";

export async function connectDatabase(uri: string): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri);
    return mongoose;
  } catch (error) {
    throw new Error(`Error al conectarse a MongoDB:  ${(error as Error).message}`);
  }
}
