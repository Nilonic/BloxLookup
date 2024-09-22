# API Documentation for This App

Elements in square brackets will be replaced with the appropriate values for each request.

## Base URL
All API endpoints are accessed relative to the base URL of `/api/`.

### Example:
- For a request to the `/api/game` endpoint with a universe ID of `33214`, the full URL would be `/api/game/33214`.

## POST Requests

### `/api/generate-key`
- **Description**: Generates a new API key for accessing secured endpoints.
- **Arguments**: None
- **Requires API Key**: No
- **Returns**:
  ```json
  {
    "apiKey": "[key]"
  }
  ```

## GET Requests

### `/api/universe/`
- **Description**: Retrieves the universe ID for a specific game.
- **Arguments**: `:gameId` – The ID of the game for which you want to obtain the universe ID.
- **Requires API Key**: Yes, must be included in the request header.
- **Returns**:
  - Success:
    ```json
    {
      "universeId": "[ID]"
    }
    ```
  - Error:
    ```json
    {
      "error": "[error.message]"
    }
    ```

### `/api/game/`
- **Description**: Fetches data related to a specific universe.
- **Arguments**: `:universeId` – The ID of the universe for which you want to retrieve data.
- **Requires API Key**: Yes, must be included in the request header.
- **Returns**:
  - Success:
    ```json
    {
    "data": [
          {
            "id": "[integer]",
            "rootPlaceId": "[integer]",
            "name": "[string]",
            "description": "[string]",
            "sourceName": "[string]",
            "sourceDescription": "[string]",
            "creator": {
              "id": "[integer]",
              "name": "[string]",
              "type": "[string]",
              "isRNVAccount": [boolean],
              "hasVerifiedBadge": [boolean]
            },
            "price": "[null or integer]",
            "allowedGearGenres": ["[string]"],
            "allowedGearCategories": ["[string]"],
            "isGenreEnforced": [boolean],
            "copyingAllowed": [boolean],
            "playing": "[integer]",
            "visits": "[integer]",
            "maxPlayers": "[integer]",
            "created": "[ISO 8601 date]",
            "updated": "[ISO 8601 date]",
            "studioAccessToApisAllowed": [boolean],
            "createVipServersAllowed": [boolean],
            "universeAvatarType": "[string]",
            "genre": "[string]",
            "isAllGenre": [boolean],
            "isFavoritedByUser": [boolean],
            "favoritedCount": "[integer]"
          }
        ]
    }
    ```
    (in actual responses, this will be filled out with data)
  - Error:
    ```json
    {
      "error": "error.message"
    }
    ```

## Legal Disclaimer

This application is not affiliated, associated, or partnered with Roblox Corporation in any way. It is not authorized, endorsed, or sponsored by Roblox. All Roblox trademarks are the property of Roblox Corporation.