import { isExcludedElement } from "../common/utils.js";

let selectedLayers = new Set();
let shiftKeyDown = false;
let ctrlKeyDown = false;
let layerIdCounter = 0;
let isDragging = false;
let draggedElements = [];
let lastDropTarget = null;
let domChanged = false;

let modifiedDOMSnapshot = null;
let elementChanges = [];

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

function captureModifiedDOMSnapshot() {
  modifiedDOMSnapshot = document.documentElement.outerHTML;
}

function getXPath(element) {
  if (element.id !== "") {
    return `//*[@id="${element.id}"]`;
  }

  let path = "";
  for (
    let node = element;
    node && node.nodeType === Node.ELEMENT_NODE;
    node = node.parentNode
  ) {
    let index = 1;
    for (
      let sibling = node.previousElementSibling;
      sibling;
      sibling = sibling.previousElementSibling
    ) {
      if (sibling.nodeName === node.nodeName) {
        index++;
      }
    }
    const tagName = node.nodeName.toLowerCase();
    path = `/${tagName}[${index}]` + path;
  }

  return path;
}

function verifyXPath(element, xpath) {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue === element;
  } catch (error) {
    console.error("XPath 평가 오류:", error);
    return false;
  }
}

function trackElementChange(element, changeType) {
  const elementId = element.id || `layer-${Date.now()}`;
  if (!element.id) {
    element.id = elementId;
  }

  let xpath = getXPath(element);
  if (!verifyXPath(element, xpath)) {
    console.warn("XPath 검증 실패:", element);
    console.warn("생성된 XPath:", xpath);
    xpath = `//*[@id="${elementId}"]`;
  }

  const change = {
    elementId: elementId,
    newPosition: {
      parentId: element.parentNode ? element.parentNode.id : null,
      previousSiblingId: element.previousElementSibling
        ? element.previousElementSibling.id
        : null,
      newStyles: Array.from(element.style).map(
        (style) => `${style}: ${element.style[style]}`
      ),
      XPath: xpath,
    },
    originalPosition: {
      parentId: element.parentNode ? element.parentNode.id : null,
      previousSiblingId: element.previousElementSibling
        ? element.previousElementSibling.id
        : null,
      originalStyles: Array.from(element.style).map(
        (style) => `${style}: ${element.style[style]}`
      ),
      XPath: xpath,
    },
    changeType: changeType,
  };

  elementChanges.push(change);
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

  if (isExcludedElement(targetElement)) {
    return;
  }

  if (!targetElement.id) {
    targetElement.id = `layer-${layerIdCounter++}`;
  }

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
      swapElements(draggedElement, dropTargetElement);
      trackElementChange(draggedElement, "swap");
      trackElementChange(dropTargetElement, "swap");
    } else {
      draggedElements.forEach((draggedElement) => {
        try {
          dropParent.insertBefore(
            draggedElement,
            dropTargetElement.nextSibling
          );
          trackElementChange(draggedElement, "move");
        } catch (error) {
          console.error("Error moving element:", error);
        }
      });
    }
  }

  clearSelectedLayerStyles();
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
  const clonedFirstElement = firstElement.cloneNode(true);
  const clonedSecondElement = secondElement.cloneNode(true);

  firstElement.parentNode.replaceChild(clonedSecondElement, firstElement);
  secondElement.parentNode.replaceChild(clonedFirstElement, secondElement);
}

function saveDOMChanges(customName, userId) {
  captureModifiedDOMSnapshot();

  const url = window.location.href;

  const data = {
    userId,
    url,
    customName,
    modifiedDOMSnapshot,
    elementChanges,
  };

  fetch("http://localhost:5000/api/layers/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      chrome.runtime.sendMessage({ action: "loadSavedLayers" });
      chrome.runtime.sendMessage({ action: "resetDomChanged" });
    })
    .catch((error) => {
      console.error("Error saving DOM changes:", error);
    });
}

monitorDOMChanges();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveDOMChanges") {
    saveDOMChanges(request.customName, request.userId);
  }

  if (request.action === "applySavedDOM") {
    const { modifiedDOMSnapshot, elementChanges } = request;

    if (modifiedDOMSnapshot) {
      document.documentElement.innerHTML = modifiedDOMSnapshot;
    }

    elementChanges.forEach((change) => {
      const element = document.evaluate(
        change.newPosition.XPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (!element) {
        console.warn(`요소를 찾을 수 없습니다: ${change.newPosition.XPath}`);
        return;
      }

      change.newPosition.newStyles.forEach((style) => {
        const [key, value] = style.split(":");
        element.style[key.trim()] = value.trim();
      });

      const parentElement = document.getElementById(
        change.newPosition.parentId
      );
      const prevSibling = document.getElementById(
        change.newPosition.previousSiblingId
      );
      if (parentElement) {
        parentElement.insertBefore(
          element,
          prevSibling ? prevSibling.nextSibling : null
        );
      }
    });
  }
});
