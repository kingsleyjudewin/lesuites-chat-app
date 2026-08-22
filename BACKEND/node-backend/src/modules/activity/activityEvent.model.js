import mongoose from 'mongoose';
import { ACTIVITY_TYPE } from '../../config/constants.js';

const activityEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(ACTIVITY_TYPE), required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

