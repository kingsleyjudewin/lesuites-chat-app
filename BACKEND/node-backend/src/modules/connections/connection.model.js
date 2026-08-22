import mongoose from 'mongoose';
import { CONNECTION_STATUS } from '../../config/constants.js';

const connectionRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(CONNECTION_STATUS), default: CONNECTION_STATUS.PENDING },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

connectionRequestSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);
