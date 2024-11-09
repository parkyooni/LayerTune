import { MESSAGE_ACTION } from "../config/constant";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ layerHighlightState: {} });
});

chrome.commands.onCommand.addListener((command) => {
  chrome.storage.local.get(
    "layerHighlightActive",
    ({ layerHighlightActive }) => {
      if (layerHighlightActive) {
        const action =
          command === "undo"
            ? "undoAction"
            : MESSAGE_ACTION.ACTION_SAVE_DOM_CHANGES;
        executeContentScript(action);
      }
    }
  );
});

chrome.tabs.onActivated.addListener(({ tabId }) =>
  updateLayerHighlightState(tabId)
);
chrome.tabs.onUpdated.addListener((tabId, { status }) => {
  if (status === "complete") updateLayerHighlightState(tabId);
});

const updateLayerHighlightState = (tabId) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab.url) {
      const currentUrl = new URL(tab.url).origin;
      chrome.storage.local.get(
        "layerHighlightState",
        ({ layerHighlightState = {} }) => {
          const isActive = layerHighlightState[currentUrl] || false;
          chrome.storage.local.set({ layerHighlightActive: isActive });
          chrome.tabs.sendMessage(tabId, {
            action: MESSAGE_ACTION.ACTION_UPDATE_LAYER_HIGHLIGHT,
            active: isActive,
          });
        }
      );
    }
  });
};

const executeContentScript = (action) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action });
    }
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case MESSAGE_ACTION.ACTION_GET_CURRENT_TAB_URL:
      getCurrentTabUrl(sendResponse);
      break;

    case MESSAGE_ACTION.ACTION_TOGGLE_LAYER_HIGHLIGHT:
      toggleLayerHighlight(request.active, sendResponse);
      break;

    case MESSAGE_ACTION.ACTION_SAVE_DOM_CHANGES:
      chrome.runtime.sendMessage(request.data, sendResponse);
      break;

    case MESSAGE_ACTION.ACTION_UNDO:
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab?.id) {
          chrome.tabs.sendMessage(
            tab.id,
            { action: MESSAGE_ACTION.ACTION_UNDO },
            sendResponse
          );
        }
      });
      break;

    case MESSAGE_ACTION.ACTION_DOM_CHANGED_NOTIFICATION:
      chrome.runtime.sendMessage({
        action: MESSAGE_ACTION.ACTION_UPDATE_UNDO_BUTTON,
        data: request.data,
      });
      break;

    default:
      break;
  }
  return true;
});

const getCurrentTabUrl = (sendResponse) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    sendResponse({ url: new URL(tab.url).href });
  });
};

const toggleLayerHighlight = (active, sendResponse) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab?.url) {
      const currentUrl = new URL(tab.url).origin;
      chrome.storage.local.get(
        "layerHighlightState",
        ({ layerHighlightState = {} }) => {
          layerHighlightState[currentUrl] = active;
          chrome.storage.local.set({
            layerHighlightState,
            layerHighlightActive: active,
          });
          chrome.tabs.sendMessage(tab.id, {
            action: MESSAGE_ACTION.ACTION_UPDATE_LAYER_HIGHLIGHT,
            active,
          });
          sendResponse({ status: "success" });
        }
      );
    }
  });
};
