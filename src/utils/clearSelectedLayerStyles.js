import { state } from "@/common/state";

export const clearSelectedLayerStyles = () => {
  state.selectedLayers.forEach((layer) => {
    layer.style.outline = "none";
    layer.style.backgroundColor = "transparent";
  });

  if (state.lastDropTarget) {
    state.lastDropTarget.style.backgroundColor = "transparent";
    state.lastDropTarget = null;
  }

  state.selectedLayers.clear();
};
