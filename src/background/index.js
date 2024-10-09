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
        case "reset":
          executeContentScript("resetDOM");
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

function executeContentScript(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: action });
  });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateLayerHighlightState(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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

  if (request.action === "captureOriginalDOM") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getDOM" }, (response) => {
        sendResponse({ status: "success" });
      });
    });
    return true;
  }

  if (request.action === "resetDOM") {
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveDOMChanges") {
    console.log("Saving DOM changes:", request.data);
    setTimeout(() => {
      sendResponse({
        status: "success",
        message: "Changes saved successfully",
      });
    }, 1000);
    return true;
  }
});
