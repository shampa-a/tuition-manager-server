import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is missing in .env file");
    }

    await mongoose.connect(databaseUrl);

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDatabase;