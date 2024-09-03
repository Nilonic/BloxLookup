const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Define the _DEBUG flag
const _DEBUG = true; // Set to false to disable debug logging

// Utility function to log messages based on the _DEBUG flag
function debugLog(message, colorCode = '\x1b[0m') {
    if (_DEBUG) {
        const timestamp = new Date().toISOString();
        console.log(`${colorCode}[${timestamp}] ${message}\x1b[0m`);
    }
}

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for API keys and their usage
const apiKeys = {};

// Function to generate a new API key
function generateApiKey() {
    return crypto.randomBytes(16).toString('hex');
}

// Middleware to check API key for specific routes
app.use((req, res, next) => {
    // Skip API key validation for the key generation endpoint
    if (req.path === '/api/generate-key' && req.method === 'POST') {
        return next();
    }

    // Apply API key validation for other API routes
    if (req.path.startsWith('/api/')) {
        const apiKey = req.headers['api-key'];
        if (!apiKey || !apiKeys[apiKey] || apiKeys[apiKey].usage >= 2 || Date.now() > apiKeys[apiKey].expiresAt) {
            return res.status(401).json({ error: 'Invalid or expired API key' });
        }
        apiKeys[apiKey].usage++;
    }

    next();
});

// API endpoint to get a new API key
app.post('/api/generate-key', (req, res) => {
    const key = generateApiKey();
    apiKeys[key] = {
        usage: 0,
        expiresAt: Date.now() + 30 * 1000 // 30 seconds expiry
    };
    debugLog(`Generated new API key: ${key}`, '\x1b[32m'); // Green for success
    res.json({ apiKey: key });
});

// API endpoint to get universe data
app.get('/api/universe/:gameId', async (req, res) => {
    const gameId = req.params.gameId;
    debugLog(`Received request to /api/universe/${gameId}`, '\x1b[34m'); // Blue for request

    const { default: fetch } = await import('node-fetch');
    try {
        debugLog(`Fetching universe data for gameId: ${gameId}`, '\x1b[34m'); // Blue for fetching
        const response = await fetch(`https://apis.roblox.com/universes/v1/places/${gameId}/universe`);
        
        if (!response.ok) {
            debugLog(`Failed to fetch universe data: ${response.status} ${response.statusText}`, '\x1b[31m'); // Red for error
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        debugLog(`Successfully fetched universe data for gameId: ${gameId}`, '\x1b[32m'); // Green for success
        res.json(data);
    } catch (error) {
        debugLog(`Error fetching universe data for gameId: ${gameId} - ${error.message}`, '\x1b[31m'); // Red for error
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get game data
app.get('/api/game/:universeId', async (req, res) => {
    const universeId = req.params.universeId;
    debugLog(`Received request to /api/game/${universeId}`, '\x1b[34m'); // Blue for request

    const { default: fetch } = await import('node-fetch');
    try {
        debugLog(`Fetching game data for universeId: ${universeId}`, '\x1b[34m'); // Blue for fetching
        const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
        
        if (!response.ok) {
            debugLog(`Failed to fetch game data: ${response.status} ${response.statusText}`, '\x1b[31m'); // Red for error
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        debugLog(`Successfully fetched game data for universeId: ${universeId}`, '\x1b[32m'); // Green for success
        res.json(data);
    } catch (error) {
        debugLog(`Error fetching game data for universeId: ${universeId} - ${error.message}`, '\x1b[31m'); // Red for error
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html when the root URL is accessed
app.get('/', (req, res) => {
    debugLog(`Received request to /`, '\x1b[34m'); // Blue for request
    res.sendFile(path.join(__dirname, 'public', 'index/index.html'));
});

// Cleanup function to remove expired or overused API keys
function cleanupApiKeys() {
    const now = Date.now();
    for (const key in apiKeys) {
        if (apiKeys[key].usage >= 2 || now > apiKeys[key].expiresAt) {
            if (apiKeys[key].usage >= 2)
                debugLog(`Removing overused API key: ${key}`, '\x1b[33m'); // Yellow for cleanup
            if (now > apiKeys[key].expiresAt)
                debugLog(`Removing expired API key: ${key}`, '\x1b[33m'); // Yellow for cleanup
            delete apiKeys[key];
        }
    }
}

// Set up periodic cleanup every 30 seconds
setInterval(cleanupApiKeys, 30 * 1000);

// Start the server
app.listen(port, () => {
    debugLog(`Server running at http://localhost:${port}`, '\x1b[32m'); // Green for server start
});
