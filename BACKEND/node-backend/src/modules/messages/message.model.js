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
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        seenAt: { type: Date, default: Date.now },
      },
    ],
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: Object.values(REACTION_TYPE) },
      },
    ],
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ contextType: 1, contextId: 1, createdAt: -1 });

messageSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.ciphertext; // clients only ever see the decrypted `text` the service layer attaches, never the raw blob
    return ret;
  },
});

export const Message = mongoose.model('Message', messageSchema);
