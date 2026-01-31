// background.js

const BGG_SEARCH_API = "https://boardgamegeek.com/xmlapi2/search?type=boardgame&query=";
const BGG_THING_API = "https://boardgamegeek.com/xmlapi2/thing?stats=1&id=";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "search-bgg",
    title: "Search '%s' on BGG",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-bgg" && info.selectionText) {
    handleSearch(info.selectionText.trim(), tab.id);
  }
});

async function handleSearch(query, tabId) {
  try {
    // 1. Search for the game
    const searchRes = await fetch(`${BGG_SEARCH_API}${encodeURIComponent(query)}`);
    const searchText = await searchRes.text();
    const parser = new XMLParser(searchText); // We need a way to parse XML. 
                                              // Browser-native DOMParser is not available in Service Worker context in MV3 directly 
                                              // unless we use specific tricks or a library.
                                              // Actually, `DOMParser` IS available in Service Workers since Chrome 115+. 
                                              // But to be safe and standard, we might need a workaround or check support.
                                              // Let's assume modern Chrome or use a lightweight regex/text parsing if simple, 
                                              // or use the `offscreen` API for parsing if strictly needed, 
                                              // but simple regex is often enough for BGG API which is flat.
                                              
    // Let's try native DOMParser if available (it is in newer Chrome), or fallback to a custom specific parser function.
    // For safety in a service worker without specific libraries, regex is robust enough for simple ID extraction here.
    
    // Simplistic XML parsing to find the best match
    const items = [...searchText.matchAll(/<item type="boardgame" id="(\d+)">\s*<name type="primary" value="([^"]+)"/g)];
    
    if (items.length === 0) {
      chrome.tabs.sendMessage(tabId, { action: "SHOW_ERROR", message: "No games found found on BGG." });
      return;
    }

    // "Fuzzy" logic: The API does a fuzzy search. We want the "closest" game.
    // Usually the one with the shortest name difference or just the first one returned by BGG (relevance).
    // BGG usually returns relevance sorted. We'll take the first one.
    const bestMatchId = items[0][1];

    // 2. Fetch details
    const thingRes = await fetch(`${BGG_THING_API}${bestMatchId}`);
    const thingText = await thingRes.text();
    
    // Parse Details (Regex again to avoid DOMParser issues in SW if older chrome)
    const details = parseGameDetails(thingText);
    
    chrome.tabs.sendMessage(tabId, { action: "SHOW_TOOLTIP", data: details });

  } catch (error) {
    console.error(error);
    chrome.tabs.sendMessage(tabId, { action: "SHOW_ERROR", message: "Error fetching data." });
  }
}

function parseGameDetails(xml) {
  const getTagValue = (tag, type="value", xmlStr = xml) => {
    // Helper to extract value="X" or >X<
    if (type === "value") {
      const match = xmlStr.match(new RegExp(`<${tag}[^>]*value="([^"]*)"`));
      return match ? match[1] : "?";
    } else if (type === "text") {
        const match = xmlStr.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`));
        return match ? match[1] : "?";
    }
    return "?";
  };

  const getName = () => {
       const match = xml.match(/<name type="primary"[^>]*value="([^"]*)"/);
       return match? match[1] : "Unknown Title";
  }

  return {
    title: getName(),
    year: getTagValue("yearpublished"),
    minPlayers: getTagValue("minplayers"),
    maxPlayers: getTagValue("maxplayers"),
    playingTime: getTagValue("playingtime"),
    rating: getTagValue("average", "value", xml), // rating is inside statistics/ratings/average
    weight: getTagValue("averageweight", "value", xml), // inside statistics/ratings/averageweight
    description: getTagValue("description", "text").replace(/&lt;br\/&gt;/g, " ").substring(0, 200) + "..."
  };
}
