# Instant Board Game Search Extension

A Google Chrome extension that allows you to effortlessly search for board games on a popular board game database by highlighting text on any webpage.

## Features

- **Context Menu Integration**: Right-click any highlighted text to search the database.
- **Instant Tooltip**: View game details immediately without leaving your current page.
- **Rich Data**: Displays rating, weight, player count, playing time, and description.
- **Smart Search**: Automatically finds the closest match for your query.

## Installation

You can install this extension manually in Chrome.

### Method 1: From Release (ZIP)
1. Download the latest release `.zip` file (e.g., `searchbggextension_v1.0.zip`).
2. Unzip the file to a folder on your computer.
3. **Configuration**:
    - Copy `config.js.example` to `config.js`.
    - Open `config.js` in a text editor.
    - Add your BGG API Token if required (e.g., `{ BOARD_GAME_API_TOKEN: "your_token" }`).
4. Open Google Chrome and navigate to `chrome://extensions/`.
5. Enable **Developer mode** in the top-right corner.
6. Click **Load unpacked**.
7. Select the folder you just unzipped.

### Method 2: From Source (Git)
1. Clone this repository: `git clone https://github.com/zapata131/searchbggextension.git`
2. Configure `config.js` and `.env` as needed (see Configuration section or config examples).
3. Follow steps 4-7 above, selecting the repository folder.

## Usage

1. Highlight the name of a board game on any website (e.g., "Catan").
2. Right-click the selection.
3. Choose **Search Board Game Info for 'Catan'** from the context menu.
4. A tooltip will appear with the game's details. Click anywhere outside or the 'X' button to close it.

## Development

### Project Structure

- `manifest.json`: Extension configuration (Manifest V3).
- `background.js`: Service worker handling Context Menu events and BGG API fetching.
- `content.js`: Script injected into pages to render the tooltip UI.
- `styles.css`: Styling for the tooltip.
- `icons/`: Extension icons.

### API

This extension uses a public board game XML API.

## License

MIT
