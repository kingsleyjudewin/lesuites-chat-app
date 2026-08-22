import mongoose from 'mongoose';
import { CONTEXT_TYPE, MESSAGE_STATUS, REACTION_TYPE } from '../../config/constants.js';

const messageSchema = new mongoose.Schema(
  {
    contextType: { type: String, enum: Object.values(CONTEXT_TYPE), required: true },
    contextId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ciphertext: { type: String, required: true },
    keyVersion: { type: String, required: true },
    status: { type: String, enum: Object.values(MESSAGE_STATUS), default: MESSAGE_STATUS.SENT },
