export const getElementByXPath = (xpath) => {
  try {
    return (
      document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue || null
    );
  } catch (error) {
    console.error(`Invalid XPath: ${xpath}`, error);
    return null;
  }
};
