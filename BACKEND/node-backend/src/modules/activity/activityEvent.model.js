import mongoose from 'mongoose';
import { ACTIVITY_TYPE } from '../../config/constants.js';

const activityEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
