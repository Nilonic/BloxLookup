const express = require('express'); // Importing Express framework
const path = require('path'); // Importing 'path' module to handle file paths
const crypto = require('crypto'); // Importing 'crypto' module for generating random API keys
const app = express(); // Creating an Express app instance
const port = 3000; // Defining the server port
const _DEBUG = true; // Debug flag, set to false to disable debug logging
var hasComplainedAboutGC = false; // Flag to track if a warning about garbage collection has been logged

// Clear the console for a fresh output
console.clear();
console.clear(); // Ensuring the console is clear with a double call

// Fancy ASCII art for server start message with specific color codes
console.log(`${String.fromCharCode(27)}[38;5;129m   _______________________
  /                      /
 / BloxLookup Server V1 /
/______________________/${String.fromCharCode(27)}[0m`);

// Check if garbage collection (GC) is exposed and log accordingly
if (global.gc) {
    debugLog("Starting with Garbage Collector Exposed");
} else {
    debugLog("Starting with Node's default Garbage Collector Settings");
}

// Utility function to log debug messages if the _DEBUG flag is enabled
function debugLog(message, colorCode = '\x1b[0m') {
    if (_DEBUG) {
        const timestamp = new Date().toISOString(); // Current timestamp
        console.log(`${colorCode}[${timestamp}] ${message}\x1b[0m`); // Log message with color and timestamp
    }
}

// Middleware to parse incoming JSON requests
app.use(express.json());
debugLog("Starting Middleware Parser");

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
debugLog("Setting static serving");

// In-memory store for tracking API keys and their usage
const apiKeys = {};

// Function to generate a new API key using random bytes
function generateApiKey() {
    return crypto.randomBytes(16).toString('hex'); // Generates a 16-byte hex string
}

// Middleware to handle API key validation for protected routes
debugLog("Setting up Middleware Parser");
app.use((req, res, next) => {
    // Skip API key validation for the key generation endpoint
    if (req.path === '/api/generate-key' && req.method === 'POST') {
        return next();
    }

    // Validate API key for all other API routes
    if (req.path.startsWith('/api/')) {
        const apiKey = req.headers['api-key']; // Get API key from headers
        // Check if the API key is valid and not expired/overused
        if (!apiKey || !apiKeys[apiKey] || apiKeys[apiKey].usage >= 2 || Date.now() > apiKeys[apiKey].expiresAt) {
            return res.status(401).json({ error: 'Invalid or expired API key' }); // Respond with 401 if invalid
        }
        apiKeys[apiKey].usage++; // Increment usage counter
    }

    next(); // Proceed to the next middleware/route
});

// API endpoint to generate a new API key
app.post('/api/generate-key', (req, res) => {
    const key = generateApiKey(); // Generate a new API key
    apiKeys[key] = {
        usage: 0, // Initialize usage counter
        expiresAt: Date.now() + 30 * 1000 // Set expiration time to 30 seconds
    };
    debugLog(`Generated new API key: ${key}`, '\x1b[32m'); // Log key generation success
    res.json({ apiKey: key }); // Respond with the new API key
});

// API endpoint to get universe data based on gameId
app.get('/api/universe/:gameId', async (req, res) => {
    const gameId = req.params.gameId; // Extract gameId from the URL parameter
    debugLog(`Received request to /api/universe/${gameId}`, '\x1b[34m'); // Log request

    const { default: fetch } = await import('node-fetch'); // Dynamically import 'node-fetch'
    try {
        debugLog(`Fetching universe data for gameId: ${gameId}`, '\x1b[34m'); // Log data fetch attempt
        const response = await fetch(`https://apis.roblox.com/universes/v1/places/${gameId}/universe`); // Fetch universe data
        
        if (!response.ok) { // Check for a successful response
            debugLog(`Failed to fetch universe data: ${response.status} ${response.statusText}`, '\x1b[31m'); // Log error
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Parse the JSON response
        debugLog(`Successfully fetched universe data for gameId: ${gameId}`, '\x1b[32m'); // Log success
        res.json(data); // Respond with the fetched data
    } catch (error) {
        debugLog(`Error fetching universe data for gameId: ${gameId} - ${error.message}`, '\x1b[31m'); // Log fetch error
        res.status(500).json({ error: error.message }); // Respond with 500 status and error message
    }
});

// API endpoint to get game data based on universeId
app.get('/api/game/:universeId', async (req, res) => {
    const universeId = req.params.universeId; // Extract universeId from the URL parameter
    debugLog(`Received request to /api/game/${universeId}`, '\x1b[34m'); // Log request

    const { default: fetch } = await import('node-fetch'); // Dynamically import 'node-fetch'
    try {
        debugLog(`Fetching game data for universeId: ${universeId}`, '\x1b[34m'); // Log data fetch attempt
        const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`); // Fetch game data
        
        if (!response.ok) { // Check for a successful response
            debugLog(`Failed to fetch game data: ${response.status} ${response.statusText}`, '\x1b[31m'); // Log error
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Parse the JSON response
        debugLog(`Successfully fetched game data for universeId: ${universeId}`, '\x1b[32m'); // Log success
        res.json(data); // Respond with the fetched data
    } catch (error) {
        debugLog(`Error fetching game data for universeId: ${universeId} - ${error.message}`, '\x1b[31m'); // Log fetch error
        res.status(500).json({ error: error.message }); // Respond with 500 status and error message
    }
});

// Serve index.html file when the root URL is accessed
app.get('/', (req, res) => {
    debugLog(`Received request to /`, '\x1b[34m'); // Log root request
    res.sendFile(path.join(__dirname, 'public', 'index/index.html')); // Serve the index.html file
});

// Function to clean up expired or overused API keys
function cleanupApiKeys() {
    const now = Date.now(); // Get current time
    for (const key in apiKeys) {
        // Remove keys that are overused or expired
        if (apiKeys[key].usage >= 2 || now > apiKeys[key].expiresAt) {
            if (apiKeys[key].usage >= 2)
                debugLog(`Removing overused API key: ${key}`, '\x1b[33m'); // Log key removal for overuse
            if (now > apiKeys[key].expiresAt)
                debugLog(`Removing expired API key: ${key}`, '\x1b[33m'); // Log key removal for expiration
            delete apiKeys[key]; // Delete the API key from the store
        }
    }
    // Run garbage collection if available
    if (global.gc) {
        global.gc(); // Explicitly invoke garbage collection
    } else {
        if (!hasComplainedAboutGC) { // Log a warning if GC is not exposed
            debugLog('Garbage collection not exposed. Run node with --expose-gc.', "\x1b[33m");
            hasComplainedAboutGC = true; // Set flag to prevent repeated warnings
        }
    }
}

// Set up periodic cleanup of API keys every 30 seconds
debugLog("Registering Key Cleanup script");
let cleanupInterval = setInterval(cleanupApiKeys, 30 * 1000);

// Start the server and log the server URL
debugLog(`Starting Server... (http://localhost:${port})`);
app.listen(port);

// Function to handle graceful shutdown and cleanup on exit
function exitHandler(options, exitCode) {
    if (!options.noPrint) {
        if (exitCode || exitCode === 0) console.log(`Received exit code: ${exitCode}, shutting down...`);
    }

    // Log cleanup initiation
    debugLog('Performing cleanup before exiting...', '\x1b[33m');

    // Clear the periodic API key cleanup interval
    clearInterval(cleanupInterval);

    // Perform a final cleanup of API keys
    cleanupApiKeys();

    // Run garbage collection one last time if available
    if (global.gc) {
        global.gc();
    }

    // Log that cleanup is complete
    debugLog('Cleanup complete. Server is shutting down.', '\x1b[31m'); // Red for shutdown

    // Exit the process if the option is set
    if (options.exit) {
        process.exit();
    }
}

// Setup exit handlers for various termination signals
process.on('exit', exitHandler.bind(null, { exit: true, noPrint: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
