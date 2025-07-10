const express = require("express"); // Importing Express framework
const path = require("path"); // Importing 'path' module to handle file paths
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
if (global.gc) debugLog("Starting with Garbage Collector Exposed");
else debugLog("Starting with Node's default Garbage Collector Settings");

// Utility function to log debug messages if the _DEBUG flag is enabled
function debugLog(message, colorCode = "\x1b[0m") {
  if (_DEBUG) {
    const timestamp = new Date().toISOString(); // Current timestamp
    console.log(`${colorCode}[${timestamp}] ${message}\x1b[0m`); // Log message with color and timestamp
  }
}



var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests, please try again later." // Bog standard error message, might change later, i dunno
  }
});
// Apply the rate limiting middleware to all requests
app.use(limiter);


app.use(express.json());
debugLog("Starting Middleware Parser");

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
debugLog("Setting static serving");


// API endpoint to get universe data based on gameId
app.get("/api/universe/:gameId", async (req, res) => {
  const gameId = req.params.gameId; // Extract gameId from the URL parameter
  debugLog(`Received request to /api/universe/${gameId}`, "\x1b[34m"); // Log request

  const { default: fetch } = await import("node-fetch"); // Dynamically import 'node-fetch'
  try {
    debugLog(`Fetching universe data for gameId: ${gameId}`, "\x1b[34m"); // Log data fetch attempt
    const response = await fetch(
      `https://apis.roblox.com/universes/v1/places/${gameId}/universe`
    ); // Fetch universe data

    if (!response.ok) {
      // Check for a successful response
      debugLog(
        `Failed to fetch universe data: ${response.status} ${response.statusText}`,
        "\x1b[31m"
      ); // Log error
      throw new Error("Network response was not ok");
    }

    const data = await response.json(); // Parse the JSON response
    debugLog(
      `Successfully fetched universe data for gameId: ${gameId}`,
      "\x1b[32m"
    ); // Log success
    res.json(data); // Respond with the fetched data
  } catch (error) {
    debugLog(
      `Error fetching universe data for gameId: ${gameId} - ${error.message}`,
      "\x1b[31m"
    ); // Log fetch error
    res.status(500).json({
      error: error.message,
    }); // Respond with 500 status and error message
  }
});

// API endpoint to get game data based on universeId
app.get("/api/game/:universeId", async (req, res) => {
  const universeId = req.params.universeId; // Extract universeId from the URL parameter
  debugLog(`Received request to /api/game/${universeId}`, "\x1b[34m"); // Log request

  const { default: fetch } = await import("node-fetch"); // Dynamically import 'node-fetch'
  try {
    debugLog(`Fetching game data for universeId: ${universeId}`, "\x1b[34m"); // Log data fetch attempt
    const response = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${universeId}`
    ); // Fetch game data

    if (!response.ok) {
      // Check for a successful response
      debugLog(
        `Failed to fetch game data: ${response.status} ${response.statusText}`,
        "\x1b[31m"
      ); // Log error
      throw new Error("Network response was not ok");
    }

    const data = await response.json(); // Parse the JSON response
    debugLog(
      `Successfully fetched game data for universeId: ${universeId}`,
      "\x1b[32m"
    ); // Log success
    res.json(data); // Respond with the fetched data
  } catch (error) {
    debugLog(
      `Error fetching game data for universeId: ${universeId} - ${error.message}`,
      "\x1b[31m"
    ); // Log fetch error
    res.status(500).json({
      error: error.message,
    }); // Respond with 500 status and error message
  }
});

// Fetch user details based on userId
app.get("/api/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  debugLog(`Received request to /api/user/${userId}`, "\x1b[34m");

  const { default: fetch } = await import("node-fetch");
  try {
    debugLog(`Fetching user data for userId: ${userId}`, "\x1b[34m");
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);

    if (!response.ok) {
      debugLog(
        `Failed to fetch user data: ${response.status} ${response.statusText}`,
        "\x1b[31m"
      );
      throw new Error("Failed to fetch user data.");
    }

    const data = await response.json();
    debugLog(
      `Successfully fetched user data for userId: ${userId}`,
      "\x1b[32m"
    );
    res.json(data);
  } catch (error) {
    debugLog(
      `Error fetching user data for userId: ${userId} - ${error.message}`,
      "\x1b[31m"
    );
    res.status(500).json({
      error: error.message,
    });
  }
});

// app.get("/api/icon/:universeid", async (req, res) => {
// const universeId = req.params.universeid;
//   const url = `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false`
//   try{
//   const response = await fetch(url);
//     if (!response.ok){
//       debugLog(
//         `Failed to fetch data: ${response.status} ${response.statusText}`,
//         "\x1b[31m"
//       );
//       throw new Error("Failed to fetch data.");
//     }
// 
//     const data = await response.json();
//     debugLog(data);
//     res.json(data);
//   }
//   catch (error){
//     res.status(500).json({
//       error: error.message
//     })
//   }
// });

// Fetch group details based on groupId
app.get("/api/group/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  debugLog(`Received request to /api/group/${groupId}`, "\x1b[34m");

  const { default: fetch } = await import("node-fetch");
  try {
    debugLog(`Fetching group data for groupId: ${groupId}`, "\x1b[34m");
    const response = await fetch(
      `https://groups.roblox.com/v1/groups/${groupId}`
    );

    if (!response.ok) {
      debugLog(
        `Failed to fetch group data: ${response.status} ${response.statusText}`,
        "\x1b[31m"
      );
      throw new Error("Failed to fetch group data.");
    }

    const data = await response.json();
    debugLog(
      `Successfully fetched group data for groupId: ${groupId}`,
      "\x1b[32m"
    );
    res.json(data);
  } catch (error) {
    debugLog(
      `Error fetching group data for groupId: ${groupId} - ${error.message}`,
      "\x1b[31m"
    );
    res.status(500).json({
      error: error.message,
    });
  }
});

// Serve index.html file when the root URL is accessed
app.get("/", (req, res) => {
  debugLog(`Received request to /`, "\x1b[34m"); // Log root request
  res.sendFile(path.join(__dirname, "public", "index/index.html")); // Serve the index.html file
});

app.get("/testing", (req, res) => {
  debugLog(`Received request to /testing`, "\x1b[34m");
  res.sendFile(path.join(__dirname, "public", "Testing/index.html")); // Serve the index.html file
});

// Start the server and log the server URL
console.log(`Starting Server... (http://localhost:${port})`);
app.listen(port);

// Function to handle graceful shutdown and cleanup on exit
function exitHandler(options, exitCode) {
  if (!options.noPrint) {
    if (exitCode || exitCode === 0)
      console.log(`Received exit code: ${exitCode}, shutting down...`);
  }

  // Log cleanup initiation
  debugLog("Performing cleanup before exiting...", "\x1b[33m");

  // Run garbage collection one last time if available
  if (global.gc) {
    global.gc();
  }

  // Log that cleanup is complete
  debugLog("Cleanup complete. Server is shutting down.", "\x1b[31m"); // Red for shutdown

  // Exit the process if the option is set
  if (options.exit) {
    process.exit();
  }
}

// Setup exit handlers for various termination signals
process.on(
  "exit",
  exitHandler.bind(null, {
    exit: true,
    noPrint: true,
  })
);
process.on(
  "SIGINT",
  exitHandler.bind(null, {
    exit: true,
  })
);
process.on(
  "SIGUSR1",
  exitHandler.bind(null, {
    exit: true,
  })
);
process.on(
  "SIGUSR2",
  exitHandler.bind(null, {
    exit: true,
  })
);
process.on(
  "uncaughtException",
  exitHandler.bind(null, {
    exit: true,
  })
);
