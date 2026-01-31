// content.js

// Create the tooltip container once
let tooltip = null;

function createTooltip() {
  const el = document.createElement("div");
  el.id = "bgg-extension-tooltip";
  document.body.appendChild(el);
  return el;
}

function showTooltip(data, x, y) {
  if (!tooltip) tooltip = createTooltip();

  // Basic HTML structure
  tooltip.innerHTML = `
    <div class="bgg-content">
      <div class="bgg-header">
        <h3 class="bgg-title">${data.title} <span class="bgg-year">(${data.year})</span></h3>
        <button class="bgg-close">×</button>
      </div>
      <div class="bgg-stats">
        <span class="bgg-stat">⭐ ${parseFloat(data.rating).toFixed(1)}</span>
        <span class="bgg-stat">⚖️ ${parseFloat(data.weight).toFixed(2)} / 5</span>
        <span class="bgg-stat">👥 ${data.minPlayers}-${data.maxPlayers}</span>
        <span class="bgg-stat">⏳ ${data.playingTime}m</span>
      </div>
      <p class="bgg-desc">${data.description}</p>
    </div>
  `;

  // Restore defaults
  tooltip.style.display = "block";
  tooltip.style.opacity = "1";

  // Positioning logic
  // Calculate available space to keep it on screen
  const rect = tooltip.getBoundingClientRect();
  let top = y + 10;
  let left = x + 10;

  if (left + rect.width > window.innerWidth) {
    left = window.innerWidth - rect.width - 20;
  }
  if (top + rect.height > window.innerHeight) {
    top = y - rect.height - 10; // flip up
  }

  tooltip.style.top = `${top + window.scrollY}px`;
  tooltip.style.left = `${left + window.scrollX}px`;

  // Close button handler
  tooltip.querySelector(".bgg-close").addEventListener("click", () => {
    tooltip.style.display = "none";
  });
}

function showError(message) {
  // Use the same tooltip for error but different style/content
  // We get last mouse position from a global tracker or just center it? 
  // Since message comes from background, we assume we want it near selection or center. 
  // Simpler to just use native alert for fatal errors or a toast.
  // Let's try to reuse tooltip if we have a position, otherwise alert.
  alert(`BGG Extension: ${message}`);
}

// Global mouse tracker for context menu position fallback
let lastMouseX = 0;
let lastMouseY = 0;
document.addEventListener("mousedown", (e) => {
  // Only update if it's a right click or regular click
  if (e.button === 2 || e.button === 0) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SHOW_TOOLTIP") {
    showTooltip(request.data, lastMouseX, lastMouseY);
  } else if (request.action === "SHOW_ERROR") {
    showError(request.message);
  }
});

// Close on click outside
document.addEventListener("click", (e) => {
  if (tooltip && tooltip.style.display === "block" && !tooltip.contains(e.target)) {
    tooltip.style.display = "none";
  }
});
