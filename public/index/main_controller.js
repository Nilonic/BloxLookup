const apiKeyStorageKey = 'apiKey';
const apiKeyExpirationKey = 'apiKeyExpiration';
const recentSearches = new Set(); // To store unique game IDs and prevent duplicates

// Function to fetch a new API key
async function fetchApiKey() {
    try {
        const response = await fetch('/api/generate-key', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to generate API key.');
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

async function fetchGameData() {
    const url = document.getElementById('robloxUrl').value;
    const gameIdMatch = url.match(/(\d+)/);
    if (!gameIdMatch) {
        alert('Invalid Roblox URL.');
        return;
    }
    const gameId = gameIdMatch[0];

    // Get the spinner and its text elements
    const spinner = document.getElementById('spinner');
    const spinnerText = document.getElementById('spinner-text');
    const gameInfoContainer = document.getElementById('gameInfo');

    // Clear previous game info
    gameInfoContainer.innerHTML = '';

    

    // Show the spinner at the start and set the initial text
    spinner.style.display = 'flex'; // Use 'flex' since we are using flexbox for alignment
    spinnerText.textContent = 'Fetching API key...';
    

    try {
        const apiKey = await getApiKey();

        // Update spinner text
        spinnerText.textContent = 'Fetching universe data...';

        const universeResponse = await fetch(`/api/universe/${gameId}`, {
            headers: { 'api-key': apiKey }
        });

        if (!universeResponse.ok) {
            if (universeResponse.status === 401) {
                await fetchApiKey();
                return fetchGameData(); // Retry with the new key
            }
            throw new Error('Failed to fetch universe ID.');
        }

        const universeData = await universeResponse.json();
        const universeId = universeData?.universeId;

        if (!universeId) {
            throw new Error('Universe ID is missing.');
        }

        // Update spinner text
        spinnerText.textContent = 'Fetching game details...';

        const gameResponse = await fetch(`/api/game/${universeId}`, {
            headers: { 'api-key': apiKey }
        });

        if (!gameResponse.ok) {
            if (gameResponse.status === 401) {
                await fetchApiKey();
                return fetchGameData(); // Retry with the new key
            }
            throw new Error('Failed to fetch game details.');
        }

        const gameData = await gameResponse.json();
        const game = gameData?.data?.[0];


        if (!game) {
            throw new Error('Game data is missing.');
        }

        // Hide the spinner since the data is now fetched
        spinner.style.display = 'none';

        // Determine if the game is recent, new, or hot
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const isRecent = game.updated && new Date(game.updated) > twoWeeksAgo;
        const isNew = game.created && new Date(game.created) > oneMonthAgo;
        const isHot = game.playing && game.playing > 10000;

        // Populate the game info
        const title = document.createElement('h1');
        title.textContent = game.name || 'Unknown';
        gameInfoContainer.appendChild(title);

        const description = document.createElement('p');
        description.innerHTML = `<strong>Description:</strong> ${game.description.replace(/\n/g, '<br>') || 'No description available'}`;
        gameInfoContainer.appendChild(description);

        const creator = document.createElement('p');
        creator.innerHTML = `<strong>Creator:</strong> ${game.creator?.name || 'Unknown'} (${game.creator?.type || 'Unknown'}) ${game.creator?.hasVerifiedBadge ? "(Verified)" : ""}`;
        gameInfoContainer.appendChild(creator);

        const creatorURL = document.createElement("button");
        creatorURL.innerText = "Open creator page in new tab"
        creatorURL.addEventListener("mouseup", () => {
            if (game.creator?.type === "Group") {
                window.open(`https://www.roblox.com/groups/${game.creator.id}`, '_blank').focus();
            }
            else if (game.creator?.type === "User") {
                window.open(`https://www.roblox.com/users/${game.creator.id}/profile/`, '_blank').focus();
            }
        })
        creatorURL.setAttribute("rel", "noopener")
        gameInfoContainer.appendChild(creatorURL);

        const price = document.createElement('p');
        price.innerHTML = `<strong>Game Price:</strong> ${game.price ? game.price : 'Free'}`;
        gameInfoContainer.appendChild(price);

        const visits = document.createElement('p');
        visits.innerHTML = `<strong>Visits:</strong> ${game.visits?.toLocaleString() || '0'}`;
        gameInfoContainer.appendChild(visits);

        const players = document.createElement('p');
        players.innerHTML = `<strong>Players:</strong> ${game.playing?.toLocaleString() || '0'} ${isHot ? "(HOT)" : ""}`;
        gameInfoContainer.appendChild(players);

        const genre = document.createElement('p');
        genre.innerHTML = `<strong>Genre:</strong> ${game.genre || 'Unknown'}`;
        gameInfoContainer.appendChild(genre);

        const created = document.createElement('p');
        created.innerHTML = `<strong>Game Created:</strong> ${game.created ? new Date(game.created).toLocaleDateString() : 'Unknown'} ${isNew ? "(NEW)" : ""}`;
        gameInfoContainer.appendChild(created);

        const updated = document.createElement('p');
        updated.innerHTML = `<strong>Game Updated:</strong> ${game.updated ? new Date(game.updated).toLocaleDateString() : 'Unknown'} ${isRecent ? "(RECENT)" : ""}`;
        gameInfoContainer.appendChild(updated);

        addRecentSearch(gameId, game.name); // Add the recent search

    } catch (error) {
        // Hide the spinner if an error occurs
        spinner.style.display = 'none';

        // Display error message
        const errorParagraph = document.createElement('p');
        errorParagraph.textContent = `Error: ${error.message}`;
        gameInfoContainer.appendChild(errorParagraph);
    }
}

// Add a recent search to the list
function addRecentSearch(gameId, gameName) {
    if (recentSearches.has(gameId)) return; // Skip if already added

    recentSearches.add(gameId); // Add the game ID to the set

    const recentSearchesList = document.getElementById('recentSearchesList');
    const listItem = document.createElement('li');
    listItem.textContent = gameName; // Display the game name instead of URL
    listItem.onclick = () => document.getElementById('robloxUrl').value = gameId; // Set input value to the game ID on click
    recentSearchesList.appendChild(listItem);
}

// Initialize by checking or fetching the API key when the page loads
window.onload = async () => {
    await getApiKey();
};
