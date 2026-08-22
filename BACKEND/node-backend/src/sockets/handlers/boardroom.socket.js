import * as boardroomService from '../../modules/boardrooms/boardroom.service.js';

export function registerBoardroomHandlers(io, socket) {
  const userId = socket.userId;

  socket.on('join_boardroom', async (boardroomId, ack) => {
    try {
      await boardroomService.assertMember(boardroomId, userId);
      socket.join(`boardroom:${boardroomId}`);
      ack?.({ success: true });
