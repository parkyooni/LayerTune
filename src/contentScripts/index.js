import { isExcludedElement } from "../common/utils.js";

let selectedLayers = new Set();
let shiftKeyDown = false;
let ctrlKeyDown = false;
let layerIdCounter = 0;
let isDragging = false;
let draggedElements = [];
let lastDropTarget = null;
let domChanged = false;

document.addEventListener("keydown", (e) => {
  if (e.key === "Shift") {
    shiftKeyDown = true;
  }
  if (e.key === "Control" || e.key === "Meta") {
    ctrlKeyDown = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Shift") {
    shiftKeyDown = false;
  }
  if (e.key === "Control" || e.key === "Meta") {
    ctrlKeyDown = false;
  }
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
    } else {
      draggedElements.forEach((draggedElement) => {
        try {
          dropParent.insertBefore(
            draggedElement,
            dropTargetElement.nextSibling
          );
        } catch (error) {}
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

monitorDOMChanges();

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
