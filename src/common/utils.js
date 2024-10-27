import { state } from "./state";

const EXCLUDED_ELEMENTS = [
  { tagName: "body" },
  { id: "root" },
  { className: "no-drop" },
];

function matchTagName(element, exclusion) {
  return (
    exclusion.tagName && element.tagName.toLowerCase() === exclusion.tagName
  );
}

function matchId(element, exclusion) {
  return exclusion.id && element.id === exclusion.id;
}

function matchClassName(element, exclusion) {
  return exclusion.className && element.classList.contains(exclusion.className);
}

export function isExcludedElement(element) {
  return EXCLUDED_ELEMENTS.some(
    (exclusion) =>
      matchTagName(element, exclusion) ||
      matchId(element, exclusion) ||
      matchClassName(element, exclusion)
  );
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function assignUniqueIdsToDOM(node, depth = "0") {
  if (
    node.nodeType === Node.ELEMENT_NODE &&
    !["SCRIPT", "STYLE"].includes(node.nodeName)
  ) {
    node.dataset.id = `${depth}`;
  }
  Array.from(node.childNodes).forEach((child, index) =>
    assignUniqueIdsToDOM(child, `${depth}.${index}`)
  );
}

export function getXPath(element) {
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

export function getElementByXPath(xpath) {
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

export function clearSelectedLayerStyles() {
  state.selectedLayers.forEach((layer) => {
    layer.style.outline = "none";
    layer.style.backgroundColor = "transparent";
  });

  if (state.lastDropTarget) {
    state.lastDropTarget.style.backgroundColor = "transparent";
    state.lastDropTarget = null;
  }

  state.selectedLayers.clear();
}

export function applyChanges(element, change) {
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
