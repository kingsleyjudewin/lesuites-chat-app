import * as boardroomService from '../../modules/boardrooms/boardroom.service.js';

export function registerBoardroomHandlers(io, socket) {
  const userId = socket.userId;

