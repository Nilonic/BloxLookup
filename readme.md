# BloxLookup Source Code

## Notice
We are not affiliated, associated, or partnered with Roblox Corporation in any way. We are not authorized, endorsed, or sponsored by Roblox. All Roblox trademarks remain the property of the Roblox Corporation.

## Some stats here
Current backend version: 1.0.0

Current frontend version: 1.0.0

For the API, see [API.md](API.md)

## What is BloxLookup?
BloxLookup is a tool/utility that i've developed, that allows you to quickly search up a game on Roblox, and see it's stats (in full)

BloxLookup is a pet project, like all my other projects, so don't expect many updates

BloxLookup, at the moment, does not collect analytics. Future versions may include analytic colletion. in that case, `/api/Analytics/*` will be used for it

## How can i use it?
download Node, NPM and git

run `git clone https://github.com/Nilonic/BloxLookup`

run `npm install` (please run periodically to prevent xss) 

and then, after all that run: 
| Command | Type |
| ----------- | ----------- |
| `npm run start` | Normal Operation |
| `npm run start-exposed-gc` | to expose the Garbage Collector to the environment |
| `node server.js` | Run without NPM's Overhead |
| `node --expose-gc server.js` | Run without NPM's Overhead, and with the Garbage Collector exposed |