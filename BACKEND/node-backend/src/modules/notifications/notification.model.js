import mongoose from 'mongoose';
import { NOTIFICATION_TYPE } from '../../config/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
