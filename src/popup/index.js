import "@/styles/index.scss";
import { api } from "@/api";
import { state, appState } from "@/common/state";
import {
  STYLE,
  DOM_IDS,
  CLASS_NAMES,
  MESSAGE_ACTION,
  MESSAGES,
} from "@/config/constant";
import { formatDate, elements, debounce } from "@/utils";

document.addEventListener("DOMContentLoaded", () => {
  const toggleHighlightSwitch = elements.TOGGLE_HIGHLIGHT_SWITCH;
  const toggleLogin = elements.TOGGLE_LOGIN;
  const userNameSpan = elements.USER_NAME;
  const userInfo = elements.USER_INFO;
  const customNameInput = elements.CUSTOM_NAME_INPUT;
  const undoButton = elements.UNDO_BUTTON;
  const saveButton = elements.SAVE_BUTTON;
  const logoutButton = elements.LOGOUT_BUTTON;
  const confirmSaveButton = elements.CONFIRM_SAVE_BUTTON;
  const cancelSaveButton = elements.CANCEL_SAVE_BUTTON;
  const confirmDeleteButton = elements.CONFIRM_DELETE_BUTTON;
  const cancelDeleteButton = elements.CANCEL_DELETE_BUTTON;
  const tabButtons = elements.TAB_BUTTON;
  const tabContents = elements.CUSTOM_LIST;
  const currentUrlList = elements.CURRENT_URL_LIST;
  const savePopup = elements.SAVE_POPUP;
  const deleteConfirmPopup = elements.DELETE_CONFIRM_POPUP;

  chrome.storage.local.get(["userId", "userName"], ({ userId, userName }) => {
    const isLoggedIn = !!userId;
    appState.loggedIn = isLoggedIn;
    state.domChanged = false;
    updateSaveButtonState();
    updateUndoButtonState();

    userInfo.style.display = isLoggedIn ? STYLE.STYLE_BLOCK : STYLE.STYLE_NONE;
    toggleLogin.style.display = isLoggedIn
      ? STYLE.STYLE_NONE
      : STYLE.STYLE_BLOCK;

    if (isLoggedIn) {
      appState.userId = userId;
      userNameSpan.textContent = userName;

      loadSavedLayers();
    } else {
      showLoginMessage();
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTabUrl = new URL(tabs[0].url).href;
    appState.currentUrl = currentTabUrl;

    chrome.storage.local.get(
      { layerHighlightState: {} },
      ({ layerHighlightState }) => {
        const currentUrlState = !!layerHighlightState[currentTabUrl];
        toggleHighlightSwitch.checked = currentUrlState;
        updateLayerHighlight(currentUrlState);

        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: MESSAGE_ACTION.ACTION_GET_DOM_CHANGED_STATUS },
          ({ domChanged } = {}) => {
            if (domChanged) {
              state.domChanged = domChanged;
              updateSaveButtonState();
              updateUndoButtonState();
            }
          }
        );
      }
    );
  });

  toggleHighlightSwitch.addEventListener(
    "change",
    ({ target: { checked: isActive } }) => {
      chrome.storage.local.get(
        { layerHighlightState: {} },
        ({ layerHighlightState }) => {
          layerHighlightState[appState.currentUrl] = isActive;

          chrome.storage.local.set({ layerHighlightState });

          chrome.runtime.sendMessage({
            action: MESSAGE_ACTION.ACTION_TOGGLE_LAYER_HIGHLIGHT,
            active: isActive,
          });

          updateLayerHighlight(isActive);
        }
      );
    }
  );

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case MESSAGE_ACTION.ACTION_DOM_CHANGED:
        updateSaveButtonState();
        break;

      case MESSAGE_ACTION.ACTION_SAVE_DOM_CHANGES:
        saveToAPI(request.data);
        sendResponse({ status: "DOM changes received in popup" });
        break;

      case MESSAGE_ACTION.ACTION_UPDATE_UNDO_BUTTON:
        if (request.data.domChanged !== undefined) {
          state.domChanged = request.data.domChanged;
          updateUndoButtonState();
          updateSaveButtonState();
        }
        break;
    }
  });

  const updateSaveButtonState = () => {
    saveButton.disabled = !(appState.loggedIn && state.domChanged);
  };

  const updateUndoButtonState = () => {
    undoButton.disabled = !state.domChanged;
  };

  const clearActiveClassFromList = () => {
    const currentListItems = document.querySelectorAll("#currentUrlList li");
    for (const item of currentListItems) {
      item.classList.remove(CLASS_NAMES.ACTIVE);
    }
  };

  const applyLayerHighlight = (active) => {
    document.querySelectorAll("*").forEach((el) => {
      const shouldHighlight =
        active && (el.children.length > 0 || el.textContent.trim() === "");
      el.style.outline = shouldHighlight
        ? STYLE.OUTLINE_DASHED_STYLE
        : STYLE.STYLE_NONE;
    });
  };

  const updateLayerHighlight = (isActive) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: applyLayerHighlight,
        args: [isActive],
      });
    });
  };

  toggleLogin.addEventListener("click", () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (!token) {
        return console.error(
          "인증 토큰을 가져오는 데 실패했습니다",
          chrome.runtime.lastError
        );
      }
      fetchUserData(token);
    });
  });

  logoutButton.addEventListener("click", () => {
    appState.userId = null;
    appState.loggedIn = false;

    chrome.storage.local.remove(["userId", "userName"], () => {
      if (chrome.runtime.lastError) {
        return console.error(
          "사용자 정보를 삭제하는 데 실패했습니다.",
          chrome.runtime.lastError
        );
      }

      userInfo.style.display = STYLE.STYLE_NONE;
      toggleLogin.style.display = STYLE.STYLE_BLOCK;
      updateSaveButtonState();
      updateUndoButtonState();
      showLoginMessage();
    });
  });

  const fetchUserData = async (token) => {
    try {
      const user = await api.fetchUserInfo(token);

      appState.userId = user.id;
      appState.loggedIn = true;

      userNameSpan.textContent = user.name;
      userInfo.style.display = STYLE.STYLE_BLOCK;
      toggleLogin.style.display = STYLE.STYLE_NONE;

      chrome.storage.local.set({ userId: user.id, userName: user.name });

      updateSaveButtonState();
      loadSavedLayers();
    } catch (error) {
      console.error("로그인에 실패했습니다.", error);
    }
  };

  saveButton.addEventListener("click", () => {
    if (!appState.loggedIn) return alert(MESSAGES.LOGIN_REQUIRED_ALERT);

    savePopup.style.display = STYLE.STYLE_BLOCK;
  });

  customNameInput.addEventListener("input", () => {
    const errorMessageSpan = document.querySelector(".error-message");
    errorMessageSpan.innerHTML = "";
  });

  const handleSave = async () => {
    const customName = customNameInput.value.trim();
    const errorMessageSpan = document.querySelector(".error-message");
    errorMessageSpan.innerHTML = "";

    if (!customName) {
      errorMessageSpan.innerHTML = "빈 이름은 허용되지 않습니다.";
      return;
    }

    if (customName.length < 3 || customName.length > 50) {
      errorMessageSpan.innerHTML = "이름은 3자 이상, 50자 이하로 입력해주세요.";
      return;
    }

    if (!/^[a-zA-Z0-9ㄱ-ㅎ가-힣\s]+$/.test(customName)) {
      errorMessageSpan.innerHTML = "이름에는 특수 문자를 사용할 수 없습니다.";
      return;
    }

    try {
      const exists = await checkDuplicateName(customName);
      if (exists && !confirm(MESSAGES.DUPLICATE_WARNING)) return;

      requestDOMChanges(customName);
    } catch (error) {
      alert(MESSAGES.SAVE_FAILED_ALERT);
    }
  };

  confirmSaveButton.addEventListener("click", debounce(handleSave, 500));

  const checkDuplicateName = async (customName) => {
    try {
      return await api.checkDuplicateName(customName);
    } catch (error) {
      console.error(MESSAGES.CHECK_NAME_FAILED_ALERT, error);
      alert(MESSAGES.CHECK_NAME_FAILED_ALERT);
      throw error;
    }
  };

  const requestDOMChanges = (customName) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const { id: tabId, url } = tabs[0];

      chrome.tabs.sendMessage(
        tabId,
        {
          action: MESSAGE_ACTION.ACTION_SAVE_DOM_CHANGES,
          customName,
          userId: appState.userId,
          url,
        },
        {},
        async (response) => {
          if (response.status === "success" && response.data.saveDOMChanges) {
            try {
              await saveToAPI({
                elementChanges: response.data.saveDOMChanges,
                customName,
                userId: appState.userId,
                url,
              });

              updateSaveButtonState();
              updateUndoButtonState();
            } catch (error) {
              console.error(MESSAGES.SAVE_FAILED_ALERT, error);
              alert(MESSAGES.SAVE_FAILED_ALERT);
            }
          } else {
            alert(MESSAGES.DOM_DATA_FAILED_ALERT);
          }
        }
      );
    });
  };

  const saveToAPI = async (data) => {
    try {
      await api.saveLayer(data);
      await loadSavedLayers();

      savePopup.style.display = STYLE.STYLE_NONE;
      customNameInput.value = "";
      toggleHighlightSwitch.checked = false;
      state.domChanged = false;

      chrome.storage.local.get(["layerHighlightState"], (result) => {
        const urlState = result.layerHighlightState || {};
        urlState[appState.currentUrl] = false;
        chrome.storage.local.set({ layerHighlightState: urlState });
      });

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.reload(tabs[0].id);
      });
    } catch (error) {
      console.error(MESSAGES.SAVE_FAILED_ALERT, error);
      alert(MESSAGES.SAVE_FAILED_ALERT);
    }
  };

  cancelSaveButton.addEventListener("click", () => {
    savePopup.style.display = STYLE.STYLE_NONE;
    customNameInput.value = "";
  });

  undoButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: MESSAGE_ACTION.ACTION_UNDO },
        (response) => {
          if (response?.status === "reverted") {
            updateUndoButtonState();
          }
        }
      );
    });
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      tabButtons.forEach((btn) =>
        btn.classList.toggle(CLASS_NAMES.ACTIVE, btn === button)
      );

      tabContents.forEach((content) => {
        content.style.display = STYLE.STYLE_NONE;
      });
      document.getElementById(`${targetTab}List`).style.display =
        STYLE.STYLE_BLOCK;

      appState.loggedIn ? loadSavedLayers() : showLoginMessage();
    });
  });

  currentUrlList.style.display = STYLE.STYLE_BLOCK;

  const createListItem = (layer, listElementId) => {
    const li = document.createElement("li");

    const layerContent = `
    <div class="layer-list">
      <span>${layer.customName}</span>
      <div class="layer-footer">
        <span>${formatDate(layer.timestamp)}</span>
        <img src="/icons/delete_icon.png" class="delete-icon" />
      </div>
    </div>`;

    li.innerHTML =
      listElementId === "allCustomList"
        ? `${layerContent}<span class="layer-url">${layer.url}</span>`
        : layerContent;

    if (listElementId === "currentUrlList") {
      li.addEventListener("click", () => {
        clearActiveClassFromList();
        li.classList.add(CLASS_NAMES.ACTIVE);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tabId = tabs[0].id;
          chrome.tabs.sendMessage(tabId, {
            action: MESSAGE_ACTION.ACTION_APPLY_SAVED_DOM,
            elementChanges: layer.elementChanges,
          });
        });
      });
    } else if (listElementId === "allCustomList") {
      li.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(layer.url);
          alert(MESSAGES.URL_COPIED_ALERT(layer.url));
        } catch (err) {
          console.error(MESSAGES.FAILED_COPY_ALERT, err);
          alert(MESSAGES.FAILED_COPY_ALERT);
        }
      });
    }

    const deleteIcon = li.querySelector(".delete-icon");
    deleteIcon.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteConfirmPopup.style.display = STYLE.STYLE_BLOCK;
      appState.layerToDelete = layer._id;
    });

    return li;
  };

  const updateList = (listElementId, layers, emptyMessage) => {
    const listElement = document.getElementById(listElementId);

    if (!layers || layers.length === 0) {
      return (listElement.innerHTML = `<p class="empty-list">${emptyMessage}</p>`);
    }

    const listItems = layers.map((layer) =>
      createListItem(layer, listElementId)
    );
    listElement.replaceChildren(...listItems);
  };

  const loadSavedLayers = async () => {
    if (!appState.userId) return;

    try {
      const [currentUrlLayers, allCustomLayers] = await Promise.all([
        api.getLayersByUrl(appState.currentUrl, appState.userId),
        api.getAllLayers(appState.userId),
      ]);

      updateList(
        DOM_IDS.CURRENT_URL_LIST,
        currentUrlLayers,
        MESSAGES.NO_CONTENT
      );

      updateList(DOM_IDS.ALL_CUSTOM_LIST, allCustomLayers, MESSAGES.NO_CONTENT);
    } catch (error) {
      console.error("조회 실패했습니다.", error);
      showErrorMessage();
    }
  };

  const showLoginMessage = () => {
    const messageHTML = `<p class="${CLASS_NAMES.EMPTY_LIST_MESSAGE}">${MESSAGES.LOGIN_REQUIRED}</p>`;
    const lists = [DOM_IDS.CURRENT_URL_LIST, DOM_IDS.ALL_CUSTOM_LIST];

    lists.forEach((listId) => {
      document.getElementById(listId).innerHTML = messageHTML;
    });
  };

  const showErrorMessage = () => {
    const errorMessageHTML = `<p class="${CLASS_NAMES.EMPTY_LIST_MESSAGE}">${MESSAGES.LOAD_FAILED}</p>`;
    const lists = [DOM_IDS.CURRENT_URL_LIST, DOM_IDS.ALL_CUSTOM_LIST];

    lists.forEach((listId) => {
      document.getElementById(listId).innerHTML = errorMessageHTML;
    });
  };

  const handleDelete = async () => {
    if (!appState.layerToDelete) return;

    try {
      await api.deleteLayer(appState.layerToDelete);
      deleteConfirmPopup.style.display = STYLE.STYLE_NONE;
      await loadSavedLayers();
    } catch (error) {
      console.error(MESSAGES.DELETE_FAILED_ALERT, error);
      alert(MESSAGES.DELETE_FAILED_ALERT);
    }
  };

  confirmDeleteButton.addEventListener("click", debounce(handleDelete, 500));

  cancelDeleteButton.addEventListener("click", () => {
    deleteConfirmPopup.style.display = STYLE.STYLE_NONE;
    appState.layerToDelete = null;
  });
});
