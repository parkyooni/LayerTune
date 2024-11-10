import { elements } from "../../src/config/elements";
import { DOM_IDS, CLASS_NAMES } from "../../src/config/constant";

describe("elements.js 필수 테스트", () => {
  let originalGetElementById;
  let originalQuerySelectorAll;

  beforeAll(() => {
    originalGetElementById = document.getElementById;
    originalQuerySelectorAll = document.querySelectorAll;
  });

  afterAll(() => {
    document.getElementById = originalGetElementById;
    document.querySelectorAll = originalQuerySelectorAll;
  });

  it("DOM_IDS에 정의된 ID나 CLASS_NAMES에 정의된 클래스 이름으로 요소를 찾을 수 있어야 합니다", () => {
    const mockElementById = document.createElement("div");
    document.getElementById = jest.fn().mockReturnValue(mockElementById);

    expect(elements.TOGGLE_HIGHLIGHT_SWITCH).toBe(mockElementById);
    expect(document.getElementById).toHaveBeenCalledWith(
      DOM_IDS.TOGGLE_HIGHLIGHT_SWITCH
    );

    const mockElementsByClass = [
      document.createElement("div"),
      document.createElement("div"),
    ];
    document.querySelectorAll = jest.fn().mockReturnValue(mockElementsByClass);

    expect(elements.TAB_BUTTON).toBe(mockElementsByClass);
    expect(document.querySelectorAll).toHaveBeenCalledWith(
      `.${CLASS_NAMES.TAB_BUTTON}`
    );
  });

  it("없는 키에 대해 경고 메시지를 출력해야 합니다", () => {
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    expect(elements.NON_EXISTENT_KEY).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("찾을 수 없습니다")
    );
    consoleWarnSpy.mockRestore();
  });
});
