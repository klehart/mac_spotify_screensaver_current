// filepath: /Users/klemenshartmann/Desktop/Spotify-Now-Playing-main/server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/app', (req, res) => res.sendFile(path.join(__dirname, 'App.html')));
app.get('/p', (req, res) => res.sendFile(path.join(__dirname, 'P.html')));
app.get('/pc', (req, res) => res.sendFile(path.join(__dirname, 'p_center.html')));
app.get('/appc', (req, res) => res.sendFile(path.join(__dirname, 'app_center.html')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});