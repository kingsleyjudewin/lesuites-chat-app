import mongoose from 'mongoose';
import { PRESENCE_STATUS, ROLES } from '../../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 32 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.MEMBER },
    title: { type: String, trim: true, default: '' },
    avatarUrl: { type: String, default: '' },
    tags: { type: [String], default: [] },
    bio: { type: String, default: '', maxlength: 1000 },
    status: { type: String, enum: Object.values(PRESENCE_STATUS), default: PRESENCE_STATUS.OFFLINE },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.index({ username: 'text', title: 'text', tags: 'text' });

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
