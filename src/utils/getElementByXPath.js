export const getElementByXPath = (xpath) => {
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
};
