import mongoose from 'mongoose';
import { CONTEXT_TYPE } from '../../config/constants.js';

const fileAttachmentSchema = new mongoose.Schema(
  {
    uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contextType: { type: String, enum: Object.values(CONTEXT_TYPE), required: true },
    contextId: { type: mongoose.Schema.Types.ObjectId, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storageKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

fileAttachmentSchema.index({ contextType: 1, contextId: 1 });

fileAttachmentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
