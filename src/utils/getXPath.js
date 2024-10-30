export const getXPath = (element) => {
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
};
