export const assignUniqueIdsToDOM = (node, depth = "0") => {
  if (
    node.nodeType === Node.ELEMENT_NODE &&
    !["SCRIPT", "STYLE"].includes(node.nodeName)
  ) {
    node.dataset.id = `${depth}`;
  }

  Array.from(node.children).forEach((child, index) =>
    assignUniqueIdsToDOM(child, `${depth}.${index}`)
  );
};
