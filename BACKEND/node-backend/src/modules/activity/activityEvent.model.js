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

activityEventSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ActivityEvent = mongoose.model('ActivityEvent', activityEventSchema);
