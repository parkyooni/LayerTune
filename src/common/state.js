export const state = {
  selectedLayers: new Set(),
  lastDropTarget: null,
  domChanged: false,
};

export const appState = {
  userId: null,
  currentUrl: null,
  loggedIn: false,
  layerToDelete: null,
};

export const interactionState = {
  shiftKeyDown: false,
  ctrlKeyDown: false,
  isDragging: false,
  draggedElements: [],
};
