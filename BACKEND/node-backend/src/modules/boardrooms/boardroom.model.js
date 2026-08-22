import mongoose from 'mongoose';
import { BOARDROOM_ROLE } from '../../config/constants.js';

const boardroomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 500 },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: Object.values(BOARDROOM_ROLE), default: BOARDROOM_ROLE.MEMBER },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
