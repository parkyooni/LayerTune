export const matchTagName = (element, exclusion) => {
  return exclusion.tagName
    ? element.tagName.toLowerCase() === exclusion.tagName
    : false;
};

export const matchId = (element, exclusion) => {
  return exclusion.id ? element.id === exclusion.id : false;
};

export const matchClassName = (element, exclusion) => {
  return exclusion.className
    ? element.classList.contains(exclusion.className)
    : false;
};
