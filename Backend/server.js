import path from 'path';
import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();
// ⚡ FIX: Use Railway's dynamic PORT environment variable, fallback to 8080 locally
const PORT = process.env.PORT || 8080;

// Resolve the root directory path for static serving
const __dirname = path.resolve();

// 🛠️ 1. Serve Vite's production build folder
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// 🛠️ 2. Route all standard HTTP requests back to index.html (Handles SPA React Router)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

// Start the integrated HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Game Server listening on port ${PORT}`);
  console.log(`📡 WebSocket Gateway bound to HTTP server`);
});

// Attach WebSocket server to the same HTTP instance
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('🔌 New player connected to the map!');

  ws.on('message', (rawData) => {
    try {
      const message = JSON.parse(rawData);
      console.log("📨 Server received packet:", message.type);

      // Allow BOTH 'TILE_UPDATE' and 'INPUT_TEXT' through
      if (message.type === 'TILE_UPDATE' || message.type === 'INPUT_TEXT') {
        
        // 🎯 BROADCAST: Send this update to everyone EXCEPT the sender
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) { // 1 === WebSocket.OPEN
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