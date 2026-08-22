import mongoose from 'mongoose';
import { CONTEXT_TYPE } from '../../config/constants.js';

const fileAttachmentSchema = new mongoose.Schema(
  {
    uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contextType: { type: String, enum: Object.values(CONTEXT_TYPE), required: true },
