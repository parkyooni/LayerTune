import { getElementByXPath } from "./index";

export const getCompleteXPath = (element) => {
  if (!element?.nodeType) return null;

  if (element.id) return `//*[@id="${element.id}"]`;

  const parts = [];
  let current = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    const tagName = current.nodeName.toLowerCase();
    const index = getElementIndex(current);

    parts.unshift(`${tagName}[${index + 1}]`);
    current = current.parentNode;
  }

  return parts.length ? `/${parts.join("/")}` : null;
};

const getElementIndex = (element) => {
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

  return index;
};

export const validateXPath = (xpath) => {
  try {
    return Boolean(getElementByXPath(xpath));
  } catch (error) {
    console.error(`Failed to validate XPath: ${xpath}`, error);
    return false;
  }
};
