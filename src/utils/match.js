const matchTagName = (element, exclusion) => {
  return (
    exclusion.tagName && element.tagName.toLowerCase() === exclusion.tagName
  );
};

const matchId = (element, exclusion) => {
  return exclusion.id && element.id === exclusion.id;
};

const matchClassName = (element, exclusion) => {
  return exclusion.className && element.classList.contains(exclusion.className);
};

export const match = { matchTagName, matchId, matchClassName };
