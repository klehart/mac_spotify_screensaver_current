require('dotenv').config();
const express = require('express');
const axios = require('axios');
const open = (...args) => import('open').then(m => m.default(...args));
const cors = require('cors');
const app = express();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

let access_token = '';
let refresh_token = '';

app.use(cors());

app.get('/login', (req, res) => {
  const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state'
  ].join(' ');
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        code,
        redirect_uri,
        grant_type: 'authorization_code',
        client_id,
        client_secret
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    access_token = response.data.access_token;
    refresh_token = response.data.refresh_token;
    res.send('Authentication successful! You can close this window.');
    console.log('Spotify authentication successful.');
  } catch (err) {
    res.send('Error authenticating');
    console.error(err.response.data);
  }
});

app.get('/token', (req, res) => {
  if (!access_token) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ access_token });
});

async function refreshAccessToken() {
  if (!refresh_token) return;
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token,
        client_id,
        client_secret
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    access_token = response.data.access_token;
    console.log('Access token refreshed');
  } catch (err) {
    console.error('Error refreshing access token:', err.response.data);
  }
}

// Alle 50 Minuten Token erneuern
setInterval(refreshAccessToken, 1000 * 60 * 50);

app.get('/nowplaying', async (req, res) => {
  if (!access_token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: 'Bearer ' + access_token }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching now playing' });
  }
});

app.listen(8888, () => {
  console.log('Spotify proxy listening on http://localhost:8888');
  open('http://localhost:8888/login');
});