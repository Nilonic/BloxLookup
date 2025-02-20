const apiKeyStorageKey = 'apiKey';
const apiKeyExpirationKey = 'apiKeyExpiration';
const recentSearches = new Set(); // To store unique game IDs and prevent duplicates

// Function to fetch a new API key
async function fetchApiKey() {
    try {
        const response = await fetch('/api/generate-key', { method: 'POST' });
        if (!response.ok) throw new Error("Failed to generate API key. %O", response);
        const data = await response.json();
        localStorage.setItem(apiKeyStorageKey, data.apiKey || '');
        localStorage.setItem(apiKeyExpirationKey, Date.now() + 30 * 1000); // Set expiry to 30 seconds from now
    } catch (error) {
        console.error('Error fetching API key:', error.message);
        alert('Error generating API key.');
    }
}

// Function to get the API key from storage or fetch a new one if needed
async function getApiKey() {
    const storedKey = localStorage.getItem(apiKeyStorageKey);
    const expiry = localStorage.getItem(apiKeyExpirationKey);

    if (storedKey && expiry && Date.now() < expiry) {
        return storedKey;
    } else {
        await fetchApiKey();
        return localStorage.getItem(apiKeyStorageKey) || ''; // Fallback to empty string if key is not available
    }
}

async function fetchData() {
    const url = document.getElementById('robloxUrl').value;
    const searchType = document.getElementById('type').value;
    const gameInfoContainer = document.getElementById('gameInfo');

    // Clear previous results
    gameInfoContainer.innerHTML = '';

    // Extract ID from the input (for game/user/group)
    const idMatch = url.match(/(\d+)/);
    if (!idMatch) {
        alert('Invalid Roblox input. Please enter a valid game, user, or group ID.');
        return;
    }
    const searchId = idMatch[0];

    // Show loading spinner
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'flex';

    let apiKey;
    try {
        // Step 1: Request API Key
        apiKey = await getApiKey();
        if (!apiKey) throw new Error('Invalid API key received.');

        // Step 2: Determine Endpoint
        let endpoint;
        if (searchType === 'game_url') {
            endpoint = `/api/universe/${searchId}`;
        } else if (searchType === 'user') {
            endpoint = `/api/user/${searchId}`;
        } else if (searchType === 'group') {
            endpoint = `/api/group/${searchId}`;
        } else {
            throw new Error('Invalid search type.');
        }

        // Step 3: Fetch Data with API Key in Headers
        let response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'api-key': apiKey
            }
        });

        // If the request fails due to an invalid API key, fetch a new key and retry
        if (!response.ok) {
            if (response.status === 401) { // If API key is invalid
                console.log('API key invalid, fetching a new one...');
                await fetchApiKey(); // Fetch a new API key
                apiKey = await getApiKey(); // Get the new API key
                response = await fetch(endpoint, { // Retry the request with the new key
                    method: 'GET',
                    headers: {
                        'api-key': apiKey
                    }
                });
            }

            if (!response.ok) throw new Error(`Failed to fetch ${searchType} data.`);
        }

        const data = await response.json();

        // Hide spinner
        spinner.style.display = 'none';

        // Step 4: Display Results Dynamically
        if (searchType === 'game_url') {
            gameInfoContainer.innerHTML = `
                <h1>${data.name || 'Unknown'}</h1>
                <p><strong>Description:</strong> ${data.description || 'No description available'}</p>
                <p><strong>Creator:</strong> ${data.creator?.name || 'Unknown'}</p>
                <p><strong>Visits:</strong> ${data.visits ? data.visits.toLocaleString() : 'N/A'}</p>
                <p><strong>Max Players:</strong> ${data.maxPlayers || 'N/A'}</p>
                <p><strong>Created:</strong> ${new Date(data.created).toLocaleDateString() || 'N/A'}</p>
                <p><strong>Updated:</strong> ${new Date(data.updated).toLocaleDateString() || 'N/A'}</p>
            `;
        } else if (searchType === 'user') {
            gameInfoContainer.innerHTML = `
                <h1>${data.name || 'Unknown'}</h1>
                <p><strong>Display Name:</strong> ${data.displayName || 'N/A'}</p>
                <p><strong>User ID:</strong> ${data.id}</p>
                <p><strong>Created:</strong> ${new Date(data.created).toLocaleDateString() || 'N/A'}</p>
                <p><strong>Is Banned:</strong> ${data.isBanned ? 'Yes' : 'No'}</p>
            `;
        } else if (searchType === 'group') {
            gameInfoContainer.innerHTML = `
                <h1>${data.name || 'Unknown'}</h1>
                <p><strong>Description:</strong> ${data.description || 'No description available'}</p>
                <p><strong>Group ID:</strong> ${data.id}</p>
                <p><strong>Owner:</strong> ${data.owner?.username || 'N/A'} (${data.owner?.id || 'N/A'})</p>
                <p><strong>Member Count:</strong> ${data.memberCount || 'N/A'}</p>
                <p><strong>Created:</strong> ${new Date(data.created).toLocaleDateString() || 'N/A'}</p>
            `;
        }
    } catch (error) {
        console.error(error);
        spinner.style.display = 'none';
        gameInfoContainer.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}

// Add a recent search to the list
function addRecentSearch(gameId, gameName) {
    if (recentSearches.has(gameId)) return; // Skip if already added

    recentSearches.add(gameId); // Add the game ID to the set

    const recentSearchesList = document.getElementById('recentSearchesList');
    const listItem = document.createElement('li');
    listItem.textContent = gameName; // Display the game name instead of URL
    listItem.onclick = () => { document.getElementById('robloxUrl').value = gameId; fetchGameData() }; // Set input value to the game ID on click
    recentSearchesList.appendChild(listItem);
}

// Initialize by checking or fetching the API key when the page loads
document.addEventListener("DOMContentLoaded", async () => {
    await getApiKey();
});
