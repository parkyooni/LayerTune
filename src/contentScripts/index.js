import { isExcludedElement } from "../common/utils.js";

const selectedLayers = new Set();
let shiftKeyDown = false;
let ctrlKeyDown = false;
let layerIdCounter = 0;
let isDragging = false;
let draggedElements = [];
let lastDropTarget = null;
let domChanged = false;
let elementChanges = [];
const elementChangeMap = new Map();

document.addEventListener("keydown", (e) => {
  if (e.key === "Shift") shiftKeyDown = true;
  if (e.key === "Control" || e.key === "Meta") ctrlKeyDown = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Shift") shiftKeyDown = false;
  if (e.key === "Control" || e.key === "Meta") ctrlKeyDown = false;
});

chrome.storage.local.get(["layerHighlightState"], (result) => {
  chrome.runtime.sendMessage({ action: "getCurrentTabUrl" }, (response) => {
    const currentUrl = response.url;
    const isLayerHighlightActive =
      result.layerHighlightState[currentUrl] || false;
    if (isLayerHighlightActive) {
      activateLayerSelection();
    } else {
      deactivateLayerSelection();
    }
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.layerHighlightState) {
    chrome.runtime.sendMessage({ action: "getCurrentTabUrl" }, (response) => {
      const currentUrl = response.url;
      const isLayerHighlightActive =
        changes.layerHighlightState.newValue[currentUrl];
      if (isLayerHighlightActive) {
        activateLayerSelection();
      } else {
        deactivateLayerSelection();
      }
    });
  }
});

function assignUniqueIdsToDOM(node, depth = "0") {
  if (node.nodeType === Node.ELEMENT_NODE) {
    if (["SCRIPT", "STYLE"].includes(node.nodeName)) return;
    node.dataset.id = `${depth}`;
  }
  Array.from(node.childNodes).forEach((child, index) =>
    assignUniqueIdsToDOM(child, `${depth}.${index}`)
  );
}

assignUniqueIdsToDOM(document.body);

function getXPath(element) {
  if (element.id) return `//*[@id="${element.id}"]`;
  const parts = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = element.previousSibling;
    while (sibling) {
      if (
        sibling.nodeType === Node.ELEMENT_NODE &&
        sibling.nodeName === element.nodeName
      ) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    const tagName = element.nodeName.toLowerCase();
    const pathIndex = index ? `[${index + 1}]` : "";
    parts.unshift(`${tagName}${pathIndex}`);
    element = element.parentNode;
  }
  return parts.length ? `/${parts.join("/")}` : null;
}

const EXTENSION_STYLES = ["outline", "background-color"];
const EXTENSION_ATTRIBUTES = ["draggable", "style"];

function trackElementChange(element, changeType, swapResult = null) {
  const initialElementId = element.dataset.id;
  const change = {
    elementId: initialElementId,
    initialElementId: initialElementId,
    elementXPath: getXPath(element),
    updatedAttributes: {},
    updatedStyles: {},
    changeType,
  };

  Array.from(element.attributes).forEach((attr) => {
    if (!EXTENSION_ATTRIBUTES.includes(attr.name)) {
      change.updatedAttributes[attr.name] = attr.value;
    }
  });

  Array.from(element.style).forEach((style) => {
    if (!EXTENSION_STYLES.includes(style)) {
      change.updatedStyles[style] = element.style[style];
    }
  });

  if (changeType === "dragEnd" && swapResult) {
    if (swapResult.originalFirst === initialElementId) {
      change.finalElementId = swapResult.newFirst;
    } else if (swapResult.originalSecond === initialElementId) {
      change.finalElementId = swapResult.newSecond;
    }

    const updatedElement = document.querySelector(
      `[data-id="${change.finalElementId}"]`
    );
    if (updatedElement) {
      change.elementXPath = getXPath(updatedElement);
      change.updatedAttributes = {};
      Array.from(updatedElement.attributes).forEach((attr) => {
        if (!EXTENSION_ATTRIBUTES.includes(attr.name)) {
          change.updatedAttributes[attr.name] = attr.value;
        }
      });
    }
    elementChangeMap.set(initialElementId, change);
  }
  return change;
}

function getNewDepthId(element) {
  const parts = [];
  let current = element;
  while (current) {
    const parent = current.parentNode;
    if (parent) {
      const index = Array.from(parent.childNodes).indexOf(current);
      parts.unshift(index);
    }
    current = parent;
  }
  return parts.join(".");
}

function activateLayerSelection() {
  document.querySelectorAll("*").forEach((element) => {
    if (!isExcludedElement(element)) {
      if (element.children.length > 0 || element.textContent.trim() === "") {
        element.style.outline = "1px dashed var(--border-color)";
      }
    }
  });
  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("drop", handleDrop);
}

function deactivateLayerSelection() {
  document.querySelectorAll("*").forEach((element) => {
    element.style.outline = "none";
  });
  document.removeEventListener("mousedown", handleMouseDown);
  document.removeEventListener("drop", handleDrop);
  clearSelectedLayerStyles();
}

function handleMouseDown(event) {
  if (event.button !== 0) return;
  const targetElement = event.target;
  if (isExcludedElement(targetElement)) return;

  if (!shiftKeyDown && !ctrlKeyDown) {
    if (selectedLayers.has(targetElement)) {
      selectedLayers.delete(targetElement);
      targetElement.style.outline = "1px dashed var(--border-color)";
      targetElement.style.backgroundColor = "transparent";
    } else {
      selectedLayers.forEach((layer) => {
        layer.style.outline = "1px dashed var(--border-color)";
        layer.style.backgroundColor = "transparent";
      });
      selectedLayers.clear();
      selectedLayers.add(targetElement);
      targetElement.style.outline = "1px solid var(--border-layer-color)";
      targetElement.style.backgroundColor = "var(--dragging-bg-color)";
      draggedElements = [targetElement];
    }
    trackElementChange(targetElement, "select");
  } else if (shiftKeyDown && !ctrlKeyDown) {
    if (selectedLayers.has(targetElement)) {
      selectedLayers.delete(targetElement);
      targetElement.style.outline = "1px dashed var(--border-color)";
      targetElement.style.backgroundColor = "transparent";
    } else {
      selectedLayers.add(targetElement);
      targetElement.style.outline = "1px solid var(--border-layer-color)";
      targetElement.style.backgroundColor = "var(--dragging-bg-color)";
    }
    trackElementChange(targetElement, "multiSelect");
  }

  if (ctrlKeyDown && event.button === 0) {
    draggedElements = Array.from(selectedLayers);
    draggedElements.forEach(enableDragAndDrop);
  }
}

function enableDragAndDrop(layer) {
  layer.setAttribute("draggable", true);

  layer.addEventListener("dragstart", (event) => {
    if (!ctrlKeyDown) return;
    event.dataTransfer.setData("text/plain", layer.id);
    isDragging = true;
    trackElementChange(layer, "dragStart");
  });

  document.addEventListener("dragover", handleDragOver);
  document.addEventListener("drop", handleDrop);

  layer.addEventListener("dragend", () => {
    if (!ctrlKeyDown) return;
    isDragging = false;
    document.removeEventListener("dragover", handleDragOver);
    document.removeEventListener("drop", handleDrop);
    clearSelectedLayerStyles();
    draggedElements = [];
    trackElementChange(layer, "dragEnd");
  });
}

function handleDragOver(event) {
  event.preventDefault();
  const dropTargetElement = event.target;

  if (dropTargetElement && !draggedElements.includes(dropTargetElement)) {
    if (lastDropTarget) {
      lastDropTarget.style.backgroundColor = "transparent";
    }

    dropTargetElement.style.backgroundColor = "var(--active-ba-color)";
    lastDropTarget = dropTargetElement;
  }
}

function handleDrop(event) {
  event.preventDefault();
  const dropTargetElement = event.target;

  if (isExcludedElement(dropTargetElement)) {
    return;
  }

  if (dropTargetElement && !draggedElements.includes(dropTargetElement)) {
    const dropParent = dropTargetElement.parentNode;

    if (draggedElements.length === 1) {
      const draggedElement = draggedElements[0];
      clearSelectedLayerStyles();

      const swapResult = swapElements(draggedElement, dropTargetElement);

      requestAnimationFrame(() => {
        trackElementChange(draggedElement, "dragEnd", swapResult);
      });
    } else {
      draggedElements.forEach((draggedElement) => {
        try {
          const originalId = draggedElement.dataset.id;
          dropParent.insertBefore(
            draggedElement,
            dropTargetElement.nextSibling
          );

          requestAnimationFrame(() => {
            assignUniqueIdsToDOM(document.body);
            const movedElement = document.querySelector(
              `[data-id="${draggedElement.dataset.id}"]`
            );
            if (movedElement) {
              trackElementChange(movedElement, "move");
            }
          });
        } catch (error) {
          console.error("Error moving element:", error);
        }
      });
    }
  }

  clearSelectedLayerStyles();
}

function saveToVersionHistory() {
  const versionedChanges = {
    timestamp: new Date().toISOString(),
    changes: Array.from(elementChangeMap.values()).map((change) => ({
      ...change,
      finalElementId: change.finalElementId || change.elementId,
    })),
  };
  versionHistory.push(versionedChanges);
  return versionedChanges;
}

function monitorDOMChanges() {
  const observer = new MutationObserver(() => {
    domChanged = true;
    chrome.runtime.sendMessage({ action: "domChanged" });
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}

function clearSelectedLayerStyles() {
  selectedLayers.forEach((layer) => {
    layer.style.outline = "none";
    layer.style.backgroundColor = "transparent";
  });

  if (lastDropTarget) {
    lastDropTarget.style.backgroundColor = "transparent";
    lastDropTarget = null;
  }

  selectedLayers.clear();
}

function swapElements(firstElement, secondElement) {
  const firstElementOriginalId = firstElement.dataset.id;
  const secondElementOriginalId = secondElement.dataset.id;

  const clonedFirstElement = firstElement.cloneNode(true);
  const clonedSecondElement = secondElement.cloneNode(true);

  firstElement.parentNode.replaceChild(clonedSecondElement, firstElement);
  secondElement.parentNode.replaceChild(clonedFirstElement, secondElement);

  assignUniqueIdsToDOM(document.body);

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
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveDOMChanges") {
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
  }

  if (request.action === "applySavedDOM") {
    const { elementChanges } = request;
    let appliedCount = 0;

    elementChanges.forEach((change) => {
      let element = document.querySelector(`[data-id="${change.elementId}"]`);

      if (!element) {
        element = document.querySelector(
          `[data-id="${change.finalElementId}"]`
        );
      }

      if (!element) {
        element = getElementByXPath(change.elementXPath);
      }

      if (element) {
        applyChanges(element, change);
        appliedCount++;
      }
    });

    assignUniqueIdsToDOM(document.body);

    sendResponse({
      status: "success",
      message: `Applied ${appliedCount} of ${elementChanges.length} changes`,
    });
    return true;
  }
});

function getElementByXPath(xpath) {
  try {
    return document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  } catch (error) {
    console.error("Error finding element by XPath:", error);
    return null;
  }
}

function isAttributesMatch(element, updatedAttributes) {
  return Object.entries(updatedAttributes).every(
    ([attr, value]) => element.getAttribute(attr) === value
  );
}

function applyChanges(element, change) {
  if (!element) return;

  const sourceElement = element;

  const targetParent = document.evaluate(
    change.elementXPath.substring(0, change.elementXPath.lastIndexOf("/")),
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (targetParent) {
    const indexMatch = change.elementXPath.match(/\[(\d+)\]$/);
    const targetIndex = indexMatch ? parseInt(indexMatch[1]) - 1 : 0;

    const targetSiblings = Array.from(targetParent.children);
    if (targetIndex >= 0 && targetIndex <= targetSiblings.length) {
      const clonedElement = sourceElement.cloneNode(true);

      if (change.finalElementId) {
        clonedElement.dataset.id = change.finalElementId;
      }

      Object.entries(change.updatedAttributes).forEach(([attr, value]) => {
        if (attr !== "data-id") {
          clonedElement.setAttribute(attr, value);
        }
      });

      Object.entries(change.updatedStyles).forEach(
        ([styleProp, styleValue]) => {
          clonedElement.style[styleProp] = styleValue;
        }
      );

      clonedElement.style.transition = "background-color 0.5s ease";
      clonedElement.style.backgroundColor = "rgba(255, 255, 0, 0.3)";

      if (targetIndex >= targetSiblings.length) {
        targetParent.appendChild(clonedElement);
      } else {
        targetParent.insertBefore(clonedElement, targetSiblings[targetIndex]);
      }

      sourceElement.remove();

      setTimeout(() => {
        clonedElement.style.backgroundColor = "";
      }, 1000);
    }
  }
}

const versionHistory = [];

monitorDOMChanges();
