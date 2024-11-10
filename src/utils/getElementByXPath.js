export const getElementByXPath = (xpath) => {
  try {
    if (xpath.startsWith('//*[@id="')) {
      const id = xpath.match(/@id="([^"]+)"/)[1];
      return document.getElementById(id);
    }

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
