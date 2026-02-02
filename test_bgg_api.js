const fs = require('fs');

// Read .env manually
let BOARD_GAME_API_TOKEN = "";
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  const match = envFile.match(/BOARD_GAME_API_TOKEN=(.*)/);
  if (match && match[1]) {
    BOARD_GAME_API_TOKEN = match[1].trim();
  }
} catch (e) {
  console.error("Could not read .env file");
}

// Mock browser APIs or just copy functions
const BGG_SEARCH_API = "https://boardgamegeek.com/xmlapi2/search?type=boardgame&query=";
const BGG_THING_API = "https://boardgamegeek.com/xmlapi2/thing?stats=1&id=";

async function testSearch(query) {
  console.log(`Searching for: "${query}"...`);
  try {
    // 1. Search for the game
    const searchRes = await fetch(`${BGG_SEARCH_API}${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "InstantBoardGameSearchTest/1.0",
        // BGG API (XMLAPI2) might not formally require a token for general use, 
        // but if the user provided one due to blocking/auth needs, we pass it here.
        // Assuming it's a cookie or bearer logic. The user provided a UUID. 
        // We will send it as a cookie 'bggusername' or 'bggpassword'? No, they said "key to interact".
        // It's likely a personal unrelated token or maybe they are hitting a new API?
        // But the previous error was `www-authenticate: Bearer`. So we try Bearer.
        "Authorization": `Bearer ${BOARD_GAME_API_TOKEN}`
      }
    });
    const searchText = await searchRes.text();
    console.log("Search API Responded. Parsing...");

    // Simplistic XML parsing to find the best match (Copied from background.js)
    const items = [...searchText.matchAll(/<item type="boardgame" id="(\d+)">\s*<name type="primary" value="([^"]+)"/g)];

    if (items.length === 0) {
      console.log("No games found.");
      console.log("DEBUG: Raw Response Start:");
      console.log(searchText.substring(0, 500));
      return;
    }

    const bestMatchId = items[0][1];
    const bestMatchName = items[0][2];
    console.log(`Found Match: ${bestMatchName} (ID: ${bestMatchId})`);

    // 2. Fetch details
    console.log(`Fetching details for ID: ${bestMatchId}...`);
    const thingRes = await fetch(`${BGG_THING_API}${bestMatchId}`, {
      headers: {
        "User-Agent": "InstantBoardGameSearchTest/1.0",
        "Authorization": `Bearer ${BGG_API_TOKEN}`
      }
    });
    const thingText = await thingRes.text();

    // Parse Details (Copied from background.js)
    const details = parseGameDetails(thingText);

    console.log("\n--- Parsed Details ---");
    console.log(details);
    console.log("----------------------\n");

  } catch (error) {
    console.error("Error during test:", error);
  }
}

function parseGameDetails(xml) {
  const getTagValue = (tag, type = "value", xmlStr = xml) => {
    // Helper to extract value="X" or >X<
    if (type === "value") {
      const match = xmlStr.match(new RegExp(`<${tag}[^>]*value="([^"]*)"`));
      return match ? match[1] : "?";
    } else if (type === "text") {
      // Updated regex to be slightly more permissive of attributes in the tag
      const match = xmlStr.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`));
      return match ? match[1] : "?";
    }
    return "?";
  };

  const getName = () => {
    const match = xml.match(/<name type="primary"[^>]*value="([^"]*)"/);
    return match ? match[1] : "Unknown Title";
  }

  // Note: Added decodeEntities for description to make it readable in console
  const description = getTagValue("description", "text")
    .replace(/&lt;br\/&gt;/g, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .substring(0, 300) + "...";

  return {
    title: getName(),
    year: getTagValue("yearpublished"),
    minPlayers: getTagValue("minplayers"),
    maxPlayers: getTagValue("maxplayers"),
    playingTime: getTagValue("playingtime"),
    rating: getTagValue("average", "value", xml),
    weight: getTagValue("averageweight", "value", xml),
    description: description
  };
}

// Run the test
// Check if running in an environment with global fetch (Node 18+)
if (!globalThis.fetch) {
  console.error("This script requires Node.js 18+ for global fetch support.");
} else {
  testSearch("Catan");
  testSearch("Wingspan");
}
