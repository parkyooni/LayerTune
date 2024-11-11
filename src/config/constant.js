export const EXCLUDED_ELEMENTS = [
  { tagName: "body" },
  { id: "root" },
  { className: "no-drop" },
];

export const DOM_IDS = {
  TOGGLE_HIGHLIGHT_SWITCH: "toggleHighlightSwitch",
  UNDO_BUTTON: "undoButton",
  SAVE_BUTTON: "saveButton",
  TOGGLE_LOGIN: "toggleLogin",
  LOGOUT_BUTTON: "logoutButton",
  USER_NAME: "userName",
  CUSTOM_NAME_INPUT: "customName",
  CONFIRM_SAVE_BUTTON: "confirmSave",
  SAVE_POPUP: "savePopup",
  CANCEL_SAVE_BUTTON: "cancelSave",
  DELETE_CONFIRM_POPUP: "deleteConfirmPopup",
  CONFIRM_DELETE_BUTTON: "confirmDelete",
  CANCEL_DELETE_BUTTON: "cancelDelete",
  USER_INFO: "userInfo",
  CURRENT_URL_LIST: "currentUrlList",
  ALL_CUSTOM_LIST: "allCustomList",
  USER_INFO: "userInfo",
};

export const CLASS_NAMES = {
  ACTIVE: "active",
  TAB_BUTTON: "tab-button",
  CUSTOM_LIST: "custom-list",
  EMPTY_LIST_MESSAGE: "empty-list",
  DELETE_ICON: "delete-icon",
};

export const MESSAGES = {
  LOGIN_REQUIRED: "로그인 해주세요.",
  NO_CONTENT: "저장된 콘텐츠가 없습니다.",
  LOAD_FAILED: "데이터를 불러오는데 실패했습니다.",
  FAILED_COPY_ALERT: "URL 복사에 실패했습니다. 다시 시도해주세요.",
  DUPLICATE_WARNING: "같은 이름의 저장된 레이어가 있습니다. 덮어쓰시겠습니까?",
  LOGIN_REQUIRED_ALERT: "로그인이 필요합니다.",
  NAME_REQUIRED_ALERT: "이름을 입력해주세요.",
  CHECK_NAME_FAILED_ALERT: "이름 중복 확인 중 오류가 발생했습니다.",
  SAVE_FAILED_ALERT: "저장 중 오류가 발생했습니다. 다시 시도해 주세요.",
  DELETE_FAILED_ALERT: "삭제 중 문제가 발생했습니다. 다시 시도해 주세요.",
  DOM_DATA_FAILED_ALERT: "DOM 데이터 전송 중 오류가 발생했습니다.",
  FIAILED_COPY_ALERT: "URL 복사에 실패했습니다.",
  URL_COPIED_ALERT: (url) => `URL이 복사되었습니다: ${url}`,
  MOVE_ELEMENT: "요소 이동 중 오류가 발생했습니다.",
  DROP_HANDLER: "드롭 핸들러에서 오류가 발생했습니다.",
};

export const STYLE = {
  EXTENSION_STYLES: ["outline", "background-color"],
  EXTENSION_ATTRIBUTES: ["draggable", "style"],
  OUTLINE_DASHED_STYLE: "1px dashed var(--border-color)",
  OUTLINE_SOLID_STYLE: "1px solid var(--border-layer-color)",
  DRAGGING_BG_COLOR: "var(--dragging-bg-color)",
  ACTIVE_BG_COLOR: "var(--active-ba-color)",
  TRANSPARENT_COLOR: "transparent",
  STYLE_NONE: "none",
  STYLE_BLOCK: "block",
};

export const COMMAND = {
  KEY_SHIFT: "Shift",
  KEY_CONTROL: "Control",
  KEY_META: "Meta",
};

export const EVENTS = {
  SELECT: "select",
  MULTI_SELECT: "multiSelect",
  MOUSEDOWN: "mousedown",
  MOVE: "move",
  DROP: "drop",
  DRAGOVER: "dragover",
  DRAGGABLE: "draggable",
  DRAGSTART: "dragstart",
  DRAGEND: "dragend",
  KEYDOWN: "keydown",
  KEYUP: "keyup",
};

export const CONFIG = {
  DEBOUNCE_DELAY: 250,
};

export const SELECTORS = {
  ALL_ELEMENTS: "*",
};

export const MESSAGE_ACTION = {
  ACTION_GET_CURRENT_TAB_URL: "getCurrentTabUrl",
  ACTION_DOM_CHANGED: "domChanged",
  ACTION_GET_DOM_CHANGED_STATUS: "getDomChangedStatus",
  ACTION_UNDO: "undo",
  ACTION_SAVE_DOM_CHANGES: "saveDOMChanges",
  ACTION_APPLY_SAVED_DOM: "applySavedDOM",
  ACTION_UPDATE_LAYER_HIGHLIGHT: "updateLayerHighlight",
  ACTION_TOGGLE_LAYER_HIGHLIGHT: "toggleLayerHighlight",
  ACTION_UPDATE_UNDO_BUTTON: "updateUndoButton",
  ACTION_DOM_CHANGED_NOTIFICATION: "domChangedNotification",
};
