const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const users = {};

io.on('connection', (socket) => {
  console.log('مستخدم متصل:', socket.id);

  socket.on('register_id', (customId) => {
    users[customId] = socket.id;
    console.log(`تم تسجيل الجهاز بالرقم: ${customId}`);
  });

  socket.on('send_offer', ({ target, from, offer }) => {
    const targetSocketId = users[target];
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming_offer', { from, offer });
    }
  });

  socket.on('send_answer', ({ target, answer }) => {
    const targetSocketId = users[target];
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming_answer', { answer });
    }
  });

  socket.on('send_candidate', ({ target, candidate }) => {
    const targetSocketId = users[target];
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming_candidate', { candidate });
    }
  });

  socket.on('disconnect', () => {
    for (let id in users) {
      if (users[id] === socket.id) {
        delete users[id];
        break;
      }
    }
    console.log('مستخدم خرج:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`السيرفر شغال على البورت ${PORT}`);
});
