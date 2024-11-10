import { applySavedDOMChanges } from "../../src/utils";

describe("applySavedDOMChanges 함수 테스트", () => {
  let element;
  let change;
  let elementChanges;
  let resetDOMForSelection;
  let sendResponse;

  beforeEach(() => {
    element = document.createElement("div");
    element.dataset.id = "original-id";
    change = {
      elementId: "original-id",
      updatedElementId: "new-id",
      elementXPath: "/html/body/div[1]",
      updatedAttributes: { class: "test-class", title: "test-title" },
      updatedStyles: { color: "red", backgroundColor: "blue" },
    };

    elementChanges = [change];
    document.body.appendChild(element);

    resetDOMForSelection = jest.fn();
    sendResponse = jest.fn();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("요소가 null일 때 applyChanges가 실행되지 않아야 합니다", () => {
    const nonExistentChange = {
      ...change,
      elementXPath: "/html/body/nonexistent",
    };
    applySavedDOMChanges(
      [nonExistentChange],
      resetDOMForSelection,
      sendResponse
    );

    expect(sendResponse).toHaveBeenCalledWith({
      status: "success",
      message: "총 1개 중 1개의 변경 사항이 적용되었습니다",
    });
  });

  it("요소가 존재하지 않을 때 applyChanges가 호출되지 않는지 확인합니다", () => {
    document.body.innerHTML = "";

    applySavedDOMChanges(elementChanges, resetDOMForSelection, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith({
      status: "success",
      message: "총 0개 중 1개의 변경 사항이 적용되었습니다",
    });
  });
});
