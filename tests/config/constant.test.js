import {
  EXCLUDED_ELEMENTS,
  DOM_IDS,
  CLASS_NAMES,
  MESSAGES,
  STYLE,
  COMMAND,
  EVENTS,
  CONFIG,
  MESSAGE_ACTION,
} from "../../src/config/constant";

describe("constant.js 필수 테스트", () => {
  it("EXCLUDED_ELEMENTS가 필요한 태그, ID, 클래스 이름을 포함해야 합니다", () => {
    expect(EXCLUDED_ELEMENTS).toContainEqual({ tagName: "body" });
    expect(EXCLUDED_ELEMENTS).toContainEqual({ id: "root" });
    expect(EXCLUDED_ELEMENTS).toContainEqual({ className: "no-drop" });
  });

  it("DOM_IDS에 필수 요소 ID가 포함되어야 합니다", () => {
    expect(DOM_IDS.TOGGLE_HIGHLIGHT_SWITCH).toBe("toggleHighlightSwitch");
    expect(DOM_IDS.UNDO_BUTTON).toBe("undoButton");
    expect(DOM_IDS.SAVE_BUTTON).toBe("saveButton");
  });

  it("CLASS_NAMES에 필수 클래스 이름이 포함되어야 합니다", () => {
    expect(CLASS_NAMES.ACTIVE).toBe("active");
    expect(CLASS_NAMES.TAB_BUTTON).toBe("tab-button");
  });

  it("MESSAGES에 로그인 및 알림 관련 메시지가 포함되어야 합니다", () => {
    expect(MESSAGES.LOGIN_REQUIRED).toBe("로그인 해주세요.");
    expect(MESSAGES.NO_CONTENT).toBe("저장된 콘텐츠가 없습니다.");
  });

  it("STYLE에 기본 스타일 속성이 포함되어야 합니다", () => {
    expect(STYLE.OUTLINE_DASHED_STYLE).toBe("1px dashed var(--border-color)");
    expect(STYLE.ACTIVE_BG_COLOR).toBe("var(--active-ba-color)");
  });

  it("COMMAND에 필수 키가 포함되어야 합니다", () => {
    expect(COMMAND.KEY_SHIFT).toBe("Shift");
    expect(COMMAND.KEY_CONTROL).toBe("Control");
  });

  it("EVENTS에 필수 이벤트가 포함되어야 합니다", () => {
    expect(EVENTS.SELECT).toBe("select");
    expect(EVENTS.DRAGSTART).toBe("dragstart");
  });

  it("CONFIG에 딜레이 설정이 포함되어야 합니다", () => {
    expect(CONFIG.DEBOUNCE_DELAY).toBe(250);
  });

  it("MESSAGE_ACTION에 주요 액션이 포함되어야 합니다", () => {
    expect(MESSAGE_ACTION.ACTION_GET_CURRENT_TAB_URL).toBe("getCurrentTabUrl");
    expect(MESSAGE_ACTION.ACTION_SAVE_DOM_CHANGES).toBe("saveDOMChanges");
  });
});
