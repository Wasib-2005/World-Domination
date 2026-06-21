const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = 8080;

const server = app.listen(PORT, () => {
  console.log(`🚀 Game Server listening on http://localhost:${PORT}`);
  console.log(`📡 WebSocket Gateway ready at ws://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('🔌 New player connected to the map!');

  ws.on('message', (rawData) => {
    try {
      const message = JSON.parse(rawData);
      console.log("📨 Server received packet:", message.type);

      // ⚡ FIX: Allow BOTH 'TILE_UPDATE' and 'INPUT_TEXT' through the firewall
      if (message.type === 'TILE_UPDATE' || message.type === 'INPUT_TEXT') {
        
        // 🎯 BROADCAST: Send this update to everyone EXCEPT the sender
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) { // 1 means WebSocket.OPEN
            client.send(JSON.stringify(message));
          }
        });
      }
    } catch (err) {
      console.error('Failed to parse incoming packet:', err);
    }
  });

  ws.on('close', () => {
    console.log('❌ Player disconnected');
  });
});