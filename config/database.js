import mongoose from "mongoose";
import logger from "../logger/winston.logger.js";

export const connectDB = async () => {
  try {
      const conn = await mongoose.connect(process.env.MONGO_URI);

      logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
      logger.error(`Error: ${error.message}`);
      
  }
};