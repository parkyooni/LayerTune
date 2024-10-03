chrome.commands.onCommand.addListener((command) => {
  chrome.storage.local.get(["layerHighlightActive"], (result) => {
    if (result.layerHighlightActive) {
      switch (command) {
        case "undo":
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: undoAction,
            });
          });
          break;
        case "reset":
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: resetDOM,
            });
          });
          break;
        case "save":
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: saveDOMChanges,
            });
          });
          break;
        default:
          break;
      }
    }
  });
});

function undoAction() {
  if (undoStack.length > 0) {
    const lastAction = undoStack.pop();
    redoStack.push(lastAction);
  }
}

let originalDOMSnapshot = null;

function resetDOM() {
  if (originalDOMSnapshot) {
    document.documentElement.innerHTML = originalDOMSnapshot;
  }
}

function saveDOMChanges() {
  chrome.runtime.sendMessage({ action: "saveDOMChanges" });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    const currentUrl = new URL(tab.url).origin;

    chrome.storage.local.get(["activeUrl"], (result) => {
      const activeUrl = result.activeUrl || null;

      if (activeUrl !== currentUrl) {
        chrome.storage.local.set({ layerHighlightActive: false });
      }
    });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    const currentUrl = new URL(tab.url).origin;

    chrome.storage.local.get(["activeUrl"], (result) => {
      const activeUrl = result.activeUrl || null;

      if (activeUrl !== currentUrl) {
        chrome.storage.local.set({ layerHighlightActive: false });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCurrentTabUrl") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = new URL(tabs[0].url).href;
      sendResponse({ url: currentUrl });
    });
    return true;
  }
  if (request.action === "toggleLayerHighlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = new URL(tabs[0].url).origin;

      if (request.active) {
        chrome.storage.local.set({ activeUrl: currentUrl });
      } else {
        chrome.storage.local.remove("activeUrl");
      }

      sendResponse({ status: "success" });
    });
  }
  return true;
});
