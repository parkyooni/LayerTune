import { EXCLUDED_ELEMENTS } from "../common/excludedElements.js";

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
