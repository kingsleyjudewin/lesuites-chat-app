import { ActivityEvent } from './activityEvent.model.js';
import { Boardroom } from '../boardrooms/boardroom.model.js';
import { ConnectionRequest } from '../connections/connection.model.js';
import { CONNECTION_STATUS } from '../../config/constants.js';

export async function logActivity(userId, type, refId = null) {
