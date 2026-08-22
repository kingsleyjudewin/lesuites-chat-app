import mongoose from 'mongoose';
import { CONVERSATION_TYPE } from '../../config/constants.js';

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(CONVERSATION_TYPE), required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    name: { type: String, default: '' },
  },
  { timestamps: true }
);

