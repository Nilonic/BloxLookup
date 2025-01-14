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
        const creatorType = game.creator?.type || 'Unknown';

        // Define SVGs for Group and User
        const groupSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
            <title>Group</title>
            <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z"/>
        </svg>`;

        const userSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
            <title>User</title>
            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/>
        </svg>`;

        // Determine the correct SVG based on type (case-insensitive)
        let typeSVG = '';
        if (creatorType.toLowerCase() === 'group') {
            typeSVG = groupSVG;
        } else if (creatorType.toLowerCase() === 'user') {
            typeSVG = userSVG;
        }

        // Add creator details with SVG and verified badge if applicable
        creator.innerHTML = `
            <strong>Creator:</strong> 
            ${game.creator?.name || 'Unknown'} 
            ${typeSVG} 
            ${game.creator?.hasVerifiedBadge ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <rect x="5.888" width="22.89" height="22.89" transform="rotate(15 5.888 0)" fill="#0066FF" />
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M20.543 8.751L20.549 8.757C21.15 9.358 21.15 10.332 20.549 10.933L11.817 19.665L7.45 15.297C6.85 14.696 6.85 13.722 7.45 13.122L7.457 13.115C8.058 12.514 9.031 12.514 9.633 13.115L11.817 15.3L18.367 8.751C18.968 8.15 19.942 8.15 20.543 8.751Z"
                        fill="white" />
                    <title>Verified on Roblox</title>
                </svg>
` : ""}
        `;

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
    listItem.onclick = () => { document.getElementById('robloxUrl').value = gameId; fetchGameData() }; // Set input value to the game ID on click
    recentSearchesList.appendChild(listItem);
}

// Initialize by checking or fetching the API key when the page loads
window.onload = async () => {
    await getApiKey();
};
