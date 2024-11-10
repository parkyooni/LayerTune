import { clearSelectedLayerStyles } from "../../src/utils";
import { state } from "../../src/common/state";

describe("clearSelectedLayerStyles 함수 테스트", () => {
  let layer1, layer2, lastDropTarget;

  beforeEach(() => {
    layer1 = document.createElement("div");
    layer2 = document.createElement("div");
    lastDropTarget = document.createElement("div");

    layer1.style.outline = "1px solid red";
    layer1.style.backgroundColor = "blue";
    layer2.style.outline = "1px solid green";
    layer2.style.backgroundColor = "yellow";
    lastDropTarget.style.backgroundColor = "pink";

    state.selectedLayers = new Set([layer1, layer2]);
    state.lastDropTarget = lastDropTarget;

    document.body.appendChild(layer1);
    document.body.appendChild(layer2);
    document.body.appendChild(lastDropTarget);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    state.selectedLayers.clear();
    state.lastDropTarget = null;
  });

  it("모든 선택된 레이어의 스타일이 제거되어야 합니다", () => {
    clearSelectedLayerStyles();

    expect(layer1.style.outline).toBe("none");
    expect(layer1.style.backgroundColor).toBe("transparent");
    expect(layer2.style.outline).toBe("none");
    expect(layer2.style.backgroundColor).toBe("transparent");
  });

  it("lastDropTarget의 배경색이 제거되고 참조가 null로 설정되어야 합니다", () => {
    clearSelectedLayerStyles();

    expect(lastDropTarget.style.backgroundColor).toBe("transparent");
    expect(state.lastDropTarget).toBeNull();
  });

  it("selectedLayers가 비워져야 합니다", () => {
    clearSelectedLayerStyles();

    expect(state.selectedLayers.size).toBe(0);
  });
});
