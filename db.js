import mongoose from 'mongoose';
import logger from './logger.js';

async function connectToDB() {
  const url = `${process.env.MONGO_URL}`;
  await mongoose.connect(url);
  logger.info('Connected to MongoDB');
}

export default connectToDB;
