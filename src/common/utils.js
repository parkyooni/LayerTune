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
