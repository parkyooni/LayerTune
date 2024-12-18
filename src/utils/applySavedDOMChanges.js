import { getElementByXPath, assignUniqueIdsToDOM } from "./index";

const applyChanges = (element, change) => {
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

      if (change.updatedElementId) {
        clonedElement.dataset.id = change.updatedElementId;
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
};

export const applySavedDOMChanges = (
  elementChanges,
  resetDOMForSelection,
  sendResponse
) => {
  resetDOMForSelection();
  let appliedCount = 0;

  elementChanges.forEach((change) => {
    const element =
      document.querySelector(`[data-id="${change.elementId}"]`) ||
      document.querySelector(`[data-id="${change.updatedElementId}"]`) ||
      getElementByXPath(change.elementXPath);

    if (element) {
      applyChanges(element, change);
      appliedCount++;
    }
  });

  assignUniqueIdsToDOM(document.body);

  sendResponse({
    status: "success",
    message: `총 ${appliedCount}개 중 ${elementChanges.length}개의 변경 사항이 적용되었습니다`,
  });
};
