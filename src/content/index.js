import "../styles/index.scss";
import { state, interactionState } from "../common/state";
import {
  STYLE,
  COMMAND,
  EVENTS,
  MESSAGE_ACTION,
  CONFIG,
  SELECTORS,
} from "../config/constant";
import {
  applyChanges,
  assignUniqueIdsToDOM,
  clearSelectedLayerStyles,
  getElementByXPath,
  getXPath,
  isExcludedElement,
  debounce,
} from "../utils";

const body = document.body;
const elementChangeMap = new Map();
const versionHistory = [];

const handleKey = (e, isKeyDown) => {
  if (e.key === COMMAND.KEY_SHIFT) {
    interactionState.shiftKeyDown = isKeyDown;
  }
  if (e.key === COMMAND.KEY_CONTROL || e.key === COMMAND.KEY_META) {
    interactionState.ctrlKeyDown = isKeyDown;
  }
};

document.addEventListener("keydown", (e) => handleKey(e, true));
document.addEventListener("keyup", (e) => handleKey(e, false));

const trackElementChange = (element, changeType, swapResult = null) => {
  const elementId =
    element.getAttribute("data-id") || element.dataset.originalId;
  let updatedElementId = element.dataset.id;

  const change = {
    elementId,
    updatedElementId,
    elementXPath: getXPath(element),
    updatedAttributes: {},
    updatedStyles: {},
    changeType,
  };

  Array.from(element.attributes).forEach(({ name, value }) => {
    if (!STYLE.EXTENSION_ATTRIBUTES.includes(name)) {
      change.updatedAttributes[name] = value;
    }
  });

  Array.from(element.style).forEach((style) => {
    if (!STYLE.EXTENSION_STYLES.includes(style)) {
      change.updatedStyles[style] = element.style[style];
    }
  });

  if (changeType === EVENTS.DRAGEND && swapResult) {
    const finalElementId =
      swapResult.originalFirst === elementId
        ? swapResult.newFirst
        : swapResult.newSecond;

    const updatedElement = document.querySelector(
      `[data-id="${finalElementId}"]`
    );

    if (updatedElement) {
      change.elementXPath = getXPath(updatedElement);
      change.updatedAttributes = {};

      Array.from(updatedElement.attributes).forEach(({ name, value }) => {
        if (!STYLE.EXTENSION_ATTRIBUTES.includes(name)) {
          change.updatedAttributes[name] = value;
        }
      });

      change.updatedElementId = finalElementId;
    }

    elementChangeMap.set(elementId, change);
  }

  return change;
};

const activateLayerSelection = () => {
  const elements = document.querySelectorAll(SELECTORS.ALL_ELEMENTS);
  const fragment = document.createDocumentFragment();

  elements.forEach((element) => {
    const hasChildrenOrEmptyText =
      element.children.length > 0 || element.textContent.trim() === "";
    const isNotExcluded = !isExcludedElement(element);

    if (isNotExcluded && hasChildrenOrEmptyText) {
      element.style.outline = STYLE.OUTLINE_DASHED_STYLE;
      fragment.appendChild(element.cloneNode(true));
    }
  });

  document.addEventListener(EVENTS.MOUSEDOWN, handleMouseDown);
  document.addEventListener(EVENTS.DROP, handleDrop);
};

const deactivateLayerSelection = () => {
  const elements = document.querySelectorAll(SELECTORS.ALL_ELEMENTS);
  elements.forEach((element) => {
    element.style.outline = STYLE.STYLE_NONE;
  });

  document.removeEventListener(EVENTS.MOUSEDOWN, handleMouseDown);
  document.removeEventListener(EVENTS.DROP, handleDrop);

  clearSelectedLayerStyles();
};

chrome.storage.local.get(["layerHighlightState"], (result) => {
  chrome.runtime.sendMessage(
    { action: MESSAGE_ACTION.ACTION_GET_CURRENT_TAB_URL },
    (response) => {
      const currentUrl = response.url;
      const isLayerHighlightActive =
        result.layerHighlightState[currentUrl] || false;

      isLayerHighlightActive
        ? activateLayerSelection()
        : deactivateLayerSelection();
    }
  );
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.layerHighlightState) return;

  chrome.runtime.sendMessage(
    { action: MESSAGE_ACTION.ACTION_GET_CURRENT_TAB_URL },
    (response) => {
      const currentUrl = response.url;
      const isLayerHighlightActive =
        changes.layerHighlightState.newValue[currentUrl];

      isLayerHighlightActive
        ? activateLayerSelection()
        : deactivateLayerSelection();
    }
  );
});

const handleMouseDown = (event) => {
  const targetElement = event.target;
  if (event.button !== 0 || isExcludedElement(targetElement)) return;

  const isSelected = state.selectedLayers.has(targetElement);
  const { shiftKeyDown, ctrlKeyDown } = interactionState;

  const updateElementStyle = (element, isSelected) => {
    element.style.outline = isSelected
      ? STYLE.OUTLINE_SOLID_STYLE
      : STYLE.OUTLINE_DASHED_STYLE;
    element.style.backgroundColor = isSelected
      ? STYLE.DRAGGING_BG_COLOR
      : STYLE.TRANSPARENT_COLOR;
  };

  const toggleSelection = (add) => {
    if (add) {
      state.selectedLayers.add(targetElement);
      updateElementStyle(targetElement, true);
    } else {
      state.selectedLayers.delete(targetElement);
      updateElementStyle(targetElement, false);
    }
  };

  if (!shiftKeyDown && !ctrlKeyDown) {
    if (isSelected) {
      toggleSelection(false);
    } else {
      state.selectedLayers.forEach((layer) => updateElementStyle(layer, false));
      state.selectedLayers.clear();

      toggleSelection(true);
      interactionState.draggedElements = [targetElement];
    }

    trackElementChange(targetElement, "select");
  } else if (shiftKeyDown) {
    toggleSelection(!isSelected);
    trackElementChange(targetElement, "multiSelect");
  }

  if (ctrlKeyDown) {
    interactionState.draggedElements = Array.from(state.selectedLayers);
    interactionState.draggedElements.forEach(enableDragAndDrop);
  }
};

const enableDragAndDrop = (layer) => {
  layer.setAttribute(EVENTS.DRAGGABLE, true);

  const dragStartHandler = (event) => {
    if (!interactionState.ctrlKeyDown) return;

    event.dataTransfer.setData("text/plain", layer.id);
    interactionState.isDragging = true;
    trackElementChange(layer, EVENTS.DRAGSTART);
  };

  const dragEndHandler = () => {
    if (!interactionState.ctrlKeyDown) return;

    interactionState.isDragging = false;
    document.removeEventListener(EVENTS.DRAGOVER, handleDragOver);
    document.removeEventListener(EVENTS.DROP, handleDrop);
    clearSelectedLayerStyles();
    interactionState.draggedElements = [];
    trackElementChange(layer, EVENTS.DRAGEND);
  };

  layer.addEventListener(EVENTS.DRAGSTART, dragStartHandler);
  document.addEventListener(EVENTS.DRAGOVER, handleDragOver);
  document.addEventListener(EVENTS.DROP, handleDrop);
  layer.addEventListener(EVENTS.DRAGEND, dragEndHandler);
};

const handleDragOver = (event) => {
  event.preventDefault();
  const dropTargetElement = event.target;

  const isValidDropTarget =
    dropTargetElement &&
    !interactionState.draggedElements.includes(dropTargetElement);
  const hasPreviousDropTarget = state.lastDropTarget !== null;
  if (isValidDropTarget) {
    if (hasPreviousDropTarget) {
      state.lastDropTarget.style.backgroundColor = STYLE.TRANSPARENT_COLOR;
    }

    dropTargetElement.style.backgroundColor = STYLE.ACTIVE_BG_COLOR;
    state.lastDropTarget = dropTargetElement;
  }
};

const handleDrop = (event) => {
  try {
    event.preventDefault();
    const dropTargetElement = event.target;
    if (!dropTargetElement || isExcludedElement(dropTargetElement)) return;

    if (!interactionState.draggedElements.includes(dropTargetElement)) {
      const dropParent = dropTargetElement.parentNode;
      if (!dropParent) {
        return;
      }

      if (interactionState.draggedElements.length === 1) {
        const draggedElement = interactionState.draggedElements[0];
        if (!draggedElement) {
          return;
        }

        clearSelectedLayerStyles();
        const swapResult = swapElements(draggedElement, dropTargetElement);

        requestAnimationFrame(() => {
          trackElementChange(draggedElement, EVENTS.DRAGEND, swapResult);
        });
      } else {
        interactionState.draggedElements.forEach((draggedElement) => {
          try {
            dropParent.insertBefore(
              draggedElement,
              dropTargetElement.nextSibling
            );
            requestAnimationFrame(() => {
              assignUniqueIdsToDOM(body);
              trackElementChange(draggedElement, "move");
            });
          } catch (error) {
            console.error(MESSAGES.MOVE_ELEMENT, error);
          }
        });
      }

      state.domChanged = true;
      chrome.runtime.sendMessage({ action: MESSAGE_ACTION.ACTION_DOM_CHANGED });
    }
  } catch (error) {
    console.error(MESSAGES.DROP_HANDLER, error);
  } finally {
    clearSelectedLayerStyles();
  }
};

const monitorDOMChanges = () => {
  let initialLoadComplete = false;

  const debouncedChange = debounce(() => {
    state.domChanged = true;
    chrome.runtime.sendMessage({ action: MESSAGE_ACTION.ACTION_DOM_CHANGED });
  }, CONFIG.DEBOUNCE_DELAY);
  const observer = new MutationObserver(() => {
    if (initialLoadComplete) {
      debouncedChange();
    }
  });

  observer.observe(body, {
    attributes: true,
    childList: true,
    subtree: true,
  });
};

const swapElements = (firstElement, secondElement) => {
  const firstElementOriginalId = firstElement.dataset.id;
  const secondElementOriginalId = secondElement.dataset.id;

  const clonedFirstElement = firstElement.cloneNode(true);
  const clonedSecondElement = secondElement.cloneNode(true);

  firstElement.parentNode.replaceChild(clonedSecondElement, firstElement);
  secondElement.parentNode.replaceChild(clonedFirstElement, secondElement);

  assignUniqueIdsToDOM(body);

  const swappedFirst = document.querySelector(
    `[data-id="${secondElementOriginalId}"]`
  );
  const swappedSecond = document.querySelector(
    `[data-id="${firstElementOriginalId}"]`
  );

  return {
    originalFirst: firstElementOriginalId,
    originalSecond: secondElementOriginalId,
    newFirst: swappedFirst?.dataset.id,
    newSecond: swappedSecond?.dataset.id,
  };
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case MESSAGE_ACTION.ACTION_GET_DOM_CHANGED_STATUS:
      sendResponse({ domChanged: state.domChanged });
      return true;

    case MESSAGE_ACTION.ACTION_SAVE_DOM_CHANGES:
      const versionedChanges = {
        timestamp: new Date().toISOString(),
        changes: Array.from(elementChangeMap.values()),
      };

      versionHistory.push(versionedChanges);
      sendResponse({
        status: "success",
        data: { saveDOMChanges: versionedChanges.changes },
      });
      return true;
    case MESSAGE_ACTION.ACTION_APPLY_SAVED_DOM:
      const { elementChanges } = request;
      let appliedCount = 0;

      elementChanges.forEach((change) => {
        const element =
          document.querySelector(`[data-id="${change.elementId}"]`) ||
          document.querySelector(`[data-id="${change.finalElementId}"]`) ||
          getElementByXPath(change.elementXPath);

        if (element) {
          applyChanges(element, change);
          appliedCount++;
        }
      });

      assignUniqueIdsToDOM(body);
      sendResponse({
        status: "success",
        message: `Applied ${appliedCount} of ${elementChanges.length} changes`,
      });
      return true;

    default:
      return false;
  }
});

assignUniqueIdsToDOM(body);
monitorDOMChanges();
