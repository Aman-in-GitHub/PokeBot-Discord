import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String }
});

const urlSchema = new mongoose.Schema(
  {
    shortID: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    redirect: {
      type: String,
      required: true
    },
    totalClicks: {
      type: Number,
      default: 0
    },
    history: [historySchema],
    expiry: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active'
    }
  },
  { timestamps: true }
);

const URL = mongoose.model('URL', urlSchema);

export default URL;
