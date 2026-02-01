# Instant Board Game Search Extension

A Google Chrome extension that allows you to effortlessly search for board games on BoardGameGeek (BGG) by highlighting text on any webpage.

## Features

- **Context Menu Integration**: Right-click any highlighted text to search on BGG.
- **Instant Tooltip**: View game details immediately without leaving your current page.
- **Rich Data**: Displays rating, weight, player count, playing time, and description.
- **Smart Search**: Automatically finds the closest match for your query.

## Installation

1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the folder containing this extension's files.

## Usage

1. Highlight the name of a board game on any website (e.g., "Catan").
2. Right-click the selection.
3. Choose **Search 'Catan' on BGG** from the context menu.
4. A tooltip will appear with the game's details. Click anywhere outside or the 'X' button to close it.

## Development

### Project Structure

- `manifest.json`: Extension configuration (Manifest V3).
- `background.js`: Service worker handling Context Menu events and BGG API fetching.
- `content.js`: Script injected into pages to render the tooltip UI.
- `styles.css`: Styling for the tooltip.
- `icons/`: Extension icons.

### API

This extension uses the [BoardGameGeek XML API2](https://boardgamegeek.com/wiki/page/BGG_XML_API2).

## License

MIT
