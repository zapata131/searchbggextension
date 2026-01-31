# BGG Quick Search Extension Context

## Project Overview
This project is a Google Chrome Extension designed to provide quick access to BoardGameGeek (BGG) game information. It bridges the gap between reading about a game on any website and finding its specific stats on BGG.

## Architecture
The extension follows the Manifest V3 architecture:
- **Service Worker (`background.js`)**: Handles the business logic. It listens for context menu clicks, performs asynchronous requests to the BGG XML API, parses the response (handling XML parsing manually/regex since DOMParser is limited in some SW environments, though handled carefully here), and sends structured data back to the content script.
- **Content Script (`content.js` & `styles.css`)**: Responsible for the presentation layer. It listens for messages from the background script, creates a DOM element for the tooltip, positions it smartly near the cursor/selection, and applies styles.

## Design Decisions
- **Fuzzy Search**: The background script takes the first result from the BGG Search API, effectively serving as a "I'm Feeling Lucky" style search to get the most relevant result immediately.
- **XML Parsing**: Since the BGG API returns XML, and the environment is a Service Worker, we use robust Regex matching to extract fields. This avoids heavyweight dependencies or complex DOMParser polyfills for simple data extraction.
- **Scoped CSS**: The styles are prefixed or scoped to avoid colliding with the host page's styles (using `#bgg-extension-tooltip`).

## Future Improvements
- Add a "More Results" view if the first match isn't correct.
- Options page to configure what stats to show.
- Caching of results to reduce API hits.

## Development Workflow
### Branching Strategy
We follow a simple feature-branch workflow:
- **main**: The stable, production-ready branch.
- **feature/name**: Create a new branch for each feature (e.g., `feature/fuzzy-search`).
- **fix/issue**: Create a new branch for bug fixes (e.g., `fix/tooltip-position`).

All changes should be made via Pull Requests to `main`.
