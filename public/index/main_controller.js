const recentSearches = new Set(); // To store unique game IDs and prevent duplicates


async function fetchData() {
  const url = document.getElementById("robloxUrl").value;
  const searchType = document.getElementById("type").value;
  const gameInfoContainer = document.getElementById("gameInfo");

  // Clear previous results
  gameInfoContainer.innerHTML = "";

  // Extract ID from the input (for game/user/group)
  const idMatch = url.match(/(\d+)/);
  if (!idMatch) {
    alert(
      "Invalid Roblox input. Please enter a valid game, user, or group ID."
    );
    return;
  }
  const searchId = idMatch[0];

  // Show loading spinner
  const spinner = document.getElementById("spinner");
  spinner.style.display = "flex";

  try {

    // Step 2: Determine Endpoint
    let endpoint;
    if (searchType === "game_url") {
      endpoint = `/api/universe/${searchId}`;
    } else if (searchType === "user") {
      endpoint = `/api/user/${searchId}`;
    } else if (searchType === "group") {
      endpoint = `/api/group/${searchId}`;
    } else {
      throw new Error("Invalid search type.");
    }

    let response = await fetch(endpoint, {
      method: "GET",
      headers: {
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${searchType} data.`);
    }

    let data = await response.json();
    let wasOK = true;

    if (searchType == "game_url") {
      // need to do some more stuff here lmao
      Response2 = await fetch(`/api/game/${data["universeId"]}`, {
        method: "GET",
        headers: {},
      });

      if (!Response2.ok) {
        console.error("we fucked up bad");
        wasOK = false;
      } else {
        data = await Response2.json();
        data = data?.data?.[0];
      }
    }

    // Hide spinner
    spinner.style.display = "none";

    // Step 4: Display Results Dynamically
    try {
      // utility to make a <p><strong>Label:</strong> Value</p>
      function createLabeledParagraph(label, value) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.innerText = label + ":";
        p.appendChild(strong);
        p.appendChild(document.createTextNode(" " + value));
        return p;
      }

      clearContainer(gameInfoContainer);

      if (!wasOK) {
        const bigText = document.createElement("h2");
        bigText.innerText = "Sorry, could not access data!";
        const littleText = document.createElement("h3");
        littleText.innerText = "Double check the input, then try again.";
        gameInfoContainer.appendChild(bigText);
        gameInfoContainer.appendChild(littleText);
      } else if (searchType === "game_url") {
        // Title
        const title = document.createElement("h1");
        title.innerText = data.name || "Unknown name";
        gameInfoContainer.appendChild(title);

        gameInfoContainer.appendChild(
          createButtonWithURL("Join game", `roblox://placeid=${data.id}`)
        );

        // Description, Creator, Visits, Max Players, Created, Updated
        gameInfoContainer.appendChild(
          createLabeledParagraph(
            "Description",
            data.description || "No description available"
          )
        );

        //var stemp = document.createElement("img")
        //var img = await fetch(`/api/icon/${data.rootPlaceId}`)
        //stemp.src = img
        //gameInfoContainer.appendChild(
        //  stemp
        //)
        gameInfoContainer.appendChild(
          createLabeledParagraph("Creator", data.creator?.name || "Unknown")
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph(
            "Visits",
            data.visits != null ? data.visits.toLocaleString() : "N/A"
          )
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph(
            "Playing",
            data.playing != null ? data.playing.toLocaleString() : "N/A"
          )
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph(
            "Creator",
            data.creator.name != null
              ? data.creator.name.toLocaleString()
              : "N/A"
          )
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph("Max Players", data.maxPlayers || "N/A")
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph(
            "Created",
            data.created ? new Date(data.created).toLocaleDateString() : "N/A"
          )
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph(
            "Updated",
            data.updated ? new Date(data.updated).toLocaleDateString() : "N/A"
          )
        );
      } else if (searchType === "user") {
        const title = document.createElement("h1");
        title.innerText = data.name || "Unknown";
        gameInfoContainer.appendChild(title);

        gameInfoContainer.appendChild(
          createLabeledParagraph("Display Name", data.displayName || "N/A")
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph("User ID", data.id)
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph(
            "Created",
            data.created ? new Date(data.created).toLocaleDateString() : "N/A"
          )
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph("Is Banned", data.isBanned ? "Yes" : "No")
        );
      } else if (searchType === "group") {
        const title = document.createElement("h1");
        title.innerText = data.name || "Unknown";
        gameInfoContainer.appendChild(title);

        gameInfoContainer.appendChild(
          createLabeledParagraph(
            "Description",
            data.description || "No description available"
          )
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph("Group ID", data.id)
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph(
            "Owner",
            data.owner ? `${data.owner.username} (${data.owner.id})` : "N/A"
          )
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph("Member Count", data.memberCount || "N/A")
        );
        gameInfoContainer.appendChild(
          createLabeledParagraph(
            "Created",
            data.created ? new Date(data.created).toLocaleDateString() : "N/A"
          )
        );
      }
    } catch (error) {
      console.error(error);
      spinner.style.display = "none";

      clearContainer(gameInfoContainer);
      const errP = document.createElement("p");
      errP.style.color = "red";
      errP.innerText = `Error: ${error.message}`;
      gameInfoContainer.appendChild(errP);
    }
  } catch (error) {
    console.error(error);
    spinner.style.display = "none";

    clearContainer(gameInfoContainer);
    const errP = document.createElement("p");
    errP.style.color = "red";
    errP.innerText = `Error: ${error.message}`;
    gameInfoContainer.appendChild(errP);
  }
}

// Add a recent search to the list
function addRecentSearch(gameId, gameName) {
  if (recentSearches.has(gameId)) return; // Skip if already added

  recentSearches.add(gameId); // Add the game ID to the set

  const recentSearchesList = document.getElementById("recentSearchesList");
  const listItem = document.createElement("li");
  listItem.textContent = gameName; // Display the game name instead of URL
  listItem.onclick = () => {
    document.getElementById("robloxUrl").value = gameId;
    fetchGameData();
  }; // Set input value to the game ID on click
  recentSearchesList.appendChild(listItem);
}

function createButtonWithURL(text, url) {
  const tmp = document.createElement("button");
  tmp.innerText = text;
  tmp.addEventListener("click", () => {
    window.location.href = url;
  });
  return tmp;
}

// utility to clear out the container
function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}
