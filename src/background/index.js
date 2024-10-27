chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ layerHighlightState: {} });
});

chrome.commands.onCommand.addListener((command) => {
  chrome.storage.local.get(["layerHighlightActive"], (result) => {
    if (result.layerHighlightActive) {
      switch (command) {
        case "undo":
          executeContentScript("undoAction");
          break;
        case "save":
          executeContentScript("saveDOMChanges");
          break;
        default:
          break;
      }
    }
  });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateLayerHighlightState(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    updateLayerHighlightState(tabId);
  }
});

function updateLayerHighlightState(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    const currentUrl = new URL(tab.url).origin;
    chrome.storage.local.get(["layerHighlightState"], (result) => {
      const layerHighlightState = result.layerHighlightState || {};
      const isActive = layerHighlightState[currentUrl] || false;
      chrome.storage.local.set({ layerHighlightActive: isActive });
      chrome.tabs.sendMessage(tabId, {
        action: "updateLayerHighlight",
        active: isActive,
      });
    });
  });
}

function executeContentScript(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: action });
  });
}

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
      chrome.storage.local.get(["layerHighlightState"], (result) => {
        const layerHighlightState = result.layerHighlightState || {};
        layerHighlightState[currentUrl] = request.active;
        chrome.storage.local.set({
          layerHighlightState: layerHighlightState,
          layerHighlightActive: request.active,
        });
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateLayerHighlight",
          active: request.active,
        });
        sendResponse({ status: "success" });
      });
    });
    return true;
  }

  if (request.action === "saveDOMChanges") {
    chrome.runtime.sendMessage(request.data, (response) => {
      sendResponse(response);
    });
    return true;
  }
});
