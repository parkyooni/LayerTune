import { api } from "../common/app.js";
import { formatDate } from "../common/utils";
import { state } from "../common/state.js";

document.addEventListener("DOMContentLoaded", () => {
  const toggleHighlightSwitch = document.getElementById(
    "toggleHighlightSwitch"
  );
  const undoButton = document.getElementById("undoButton");
  const saveButton = document.getElementById("saveButton");
  const toggleLogin = document.getElementById("toggleLogin");
  const logoutButton = document.getElementById("logoutButton");
  const userNameSpan = document.getElementById("userName");
  const customNameInput = document.getElementById("customName");
  const confirmSaveButton = document.getElementById("confirmSave");
  const savePopup = document.getElementById("savePopup");
  const cancelSaveButton = document.getElementById("cancelSave");
  const deleteConfirmPopup = document.getElementById("deleteConfirmPopup");
  const confirmDeleteButton = document.getElementById("confirmDelete");
  const cancelDeleteButton = document.getElementById("cancelDelete");
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".custom-list");

  let userId = null;
  let currentUrl = null;
  let loggedIn = false;
  let layerToDelete = null;

  chrome.storage.local.get(["userId", "userName"], (result) => {
    loggedIn = !!result.userId;
    state.domChanged = false;
    updateSaveButtonState();
    if (loggedIn) {
      userId = result.userId;
      userNameSpan.textContent = result.userName;
      document.getElementById("userInfo").style.display = "block";
      toggleLogin.style.display = "none";
      loadSavedLayers();
    } else {
      document.getElementById("userInfo").style.display = "none";
      toggleLogin.style.display = "block";
      showLoginMessage();
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentUrl = new URL(tabs[0].url).href;

    chrome.storage.local.get(["layerHighlightState"], (result) => {
      const urlState = result.layerHighlightState || {};
      toggleHighlightSwitch.checked = !!urlState[currentUrl];
      updateLayerHighlight(!!urlState[currentUrl]);
    });

    toggleHighlightSwitch.addEventListener("change", (e) => {
      const isActive = e.target.checked;

      chrome.storage.local.get(["layerHighlightState"], (result) => {
        const urlState = result.layerHighlightState || {};
        urlState[currentUrl] = isActive;
        chrome.storage.local.set({ layerHighlightState: urlState });

        chrome.runtime.sendMessage(
          { action: "toggleLayerHighlight", active: isActive },
          () => {}
        );

        updateLayerHighlight(isActive);
      });
    });

    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "getDomChangedStatus" },
      (response) => {
        if (response && response.domChanged) {
          state.domChanged = response.domChanged;
          updateSaveButtonState();
        }
      }
    );
  });

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "domChanged") {
      state.domChanged = true;
      updateSaveButtonState();
    }

    if (request.action === "saveDOMChanges") {
      saveToAPI(request.data);
      sendResponse({ status: "DOM changes received in popup" });
    }
  });

  function updateSaveButtonState() {
    saveButton.disabled = !(loggedIn && state.domChanged);
  }

  function clearActiveClassFromList() {
    const listItems = document.querySelectorAll("#currentUrlList li");
    listItems.forEach((item) => item.classList.remove("active"));
  }

  function updateLayerHighlight(isActive) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: (active) => {
          document.querySelectorAll("*").forEach((el) => {
            if (
              active &&
              (el.children.length > 0 || el.textContent.trim() === "")
            ) {
              el.style.outline = "1px dashed var(--border-color)";
            } else {
              el.style.outline = "none";
            }
          });
        },
        args: [isActive],
      });
    });
  }

  toggleLogin.addEventListener("click", () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) return;
      fetchUserData(token);
    });
  });

  logoutButton.addEventListener("click", () => {
    userId = null;
    loggedIn = false;
    chrome.storage.local.remove(["userId", "userName"]);
    document.getElementById("userInfo").style.display = "none";
    toggleLogin.style.display = "block";
    updateSaveButtonState();
    showLoginMessage();
  });

  async function fetchUserData(token) {
    try {
      const user = await api.fetchUserInfo(token);
      userId = user.id;
      loggedIn = true;
      userNameSpan.textContent = user.name;
      document.getElementById("userInfo").style.display = "block";
      toggleLogin.style.display = "none";

      await chrome.storage.local.set({ userId: user.id, userName: user.name });
      updateSaveButtonState();
      loadSavedLayers();
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  saveButton.addEventListener("click", () => {
    if (!loggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }
    savePopup.style.display = "block";
  });

  confirmSaveButton.addEventListener("click", () => {
    const customName = customNameInput.value.trim();
    if (!customName) {
      alert("이름을 입력해주세요.");
      return;
    }

    checkDuplicateName(customName)
      .then((exists) => {
        if (
          exists &&
          !confirm("같은 이름의 저장된 레이어가 있습니다. 덮어쓰시겠습니까?")
        ) {
          return;
        }
        requestDOMChanges(customName);
      })
      .catch((error) => {
        alert("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      });
  });

  async function checkDuplicateName(customName) {
    try {
      const exists = await api.checkDuplicateName(customName);
      return exists;
    } catch (error) {
      console.error("Check duplicate name failed:", error);
      alert("이름 중복 확인 중 오류가 발생했습니다.");
      throw error;
    }
  }

  function requestDOMChanges(customName) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const url = currentTab.url;

      chrome.tabs.sendMessage(
        currentTab.id,
        { action: "saveDOMChanges", customName, userId, url },
        {},
        async (response) => {
          if (response && response.status === "success" && response.data) {
            try {
              const { saveDOMChanges } = response.data;
              await saveToAPI({
                elementChanges: saveDOMChanges,
                customName,
                userId,
                url,
              });
            } catch (error) {
              console.error("Failed to save changes:", error);
              alert("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
            }
          } else {
            alert("DOM 데이터 전송 중 오류가 발생했습니다.");
          }
        }
      );
    });
  }

  async function saveToAPI(data) {
    try {
      await api.saveLayer(data);
      await loadSavedLayers();
      savePopup.style.display = "none";
      customNameInput.value = "";
      toggleHighlightSwitch.checked = false;
      state.domChanged = false;
      chrome.storage.local.get(["layerHighlightState"], (result) => {
        const urlState = result.layerHighlightState || {};
        urlState[currentUrl] = false;
        chrome.storage.local.set({ layerHighlightState: urlState });
      });

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.reload(tabs[0].id);
      });
    } catch (error) {
      console.error("Save failed:", error);
      alert("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  }

  cancelSaveButton.addEventListener("click", () => {
    savePopup.style.display = "none";
    customNameInput.value = "";
  });

  undoButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "undo" });
    });
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      tabContents.forEach((content) => {
        content.style.display = "none";
      });

      document.getElementById(`${targetTab}List`).style.display = "block";

      if (loggedIn) {
        loadSavedLayers();
      } else {
        showLoginMessage();
      }
    });
  });

  document.getElementById("currentUrlList").style.display = "block";

  const createListItem = (layer, listElementId) => {
    const li = document.createElement("li");

    if (listElementId === "currentUrlList") {
      li.innerHTML = `
      <div class="layer-list">
        <span>${layer.customName}</span>
        <div class="layer-footer">
          <span>${formatDate(layer.timestamp)}</span>
          <img src="icons/delete_icon.png" class="delete-icon" />
        </div>
      </div>`;

      li.addEventListener("click", () => {
        clearActiveClassFromList();
        li.classList.add("active");

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "applySavedDOM",
            elementChanges: layer.elementChanges,
          });
        });
      });
    } else if (listElementId === "allCustomList") {
      li.innerHTML = `
      <div class="layer-list">
        <span>${layer.customName}</span>
        <span>${formatDate(layer.timestamp)}</span>
      </div>
      <div class="layer-footer">
        <p class="layer-url">${layer.url}</p>
        <img src="icons/delete_icon.png" class="delete-icon" />
      </div>`;

      li.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(layer.url);
          alert(`URL이 복사되었습니다: ${layer.url}`);
        } catch (err) {
          console.error("Failed to copy URL:", err);
          alert("URL 복사에 실패했습니다.");
        }
      });
    }

    const deleteIcon = li.querySelector(".delete-icon");
    deleteIcon.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteConfirmPopup.style.display = "block";
      layerToDelete = layer._id;
    });

    return li;
  };

  const updateList = (listElementId, layers, emptyMessage) => {
    const listElement = document.getElementById(listElementId);
    listElement.innerHTML = "";

    if (!layers || layers.length === 0) {
      listElement.innerHTML = `<p class="empty-list">${emptyMessage}</p>`;
      return;
    }

    layers.forEach((layer) => {
      const li = createListItem(layer, listElementId);
      listElement.appendChild(li);
    });
  };

  async function loadSavedLayers() {
    if (!userId) return;

    try {
      const currentUrlLayers = await api.getLayersByUrl(currentUrl, userId);
      updateList(
        "currentUrlList",
        currentUrlLayers,
        "저장된 콘텐츠가 없습니다."
      );

      const allCustomLayers = await api.getAllLayers(userId);
      updateList("allCustomList", allCustomLayers, "저장된 콘텐츠가 없습니다.");
    } catch (error) {
      console.error("Failed to load layers:", error);
      showErrorMessage();
    }
  }

  function showLoginMessage() {
    const lists = ["currentUrlList", "allCustomList"];
    lists.forEach((listId) => {
      const listElement = document.getElementById(listId);
      listElement.innerHTML = `<p class="empty-list">로그인 해주세요.</p>`;
    });
  }

  function showErrorMessage() {
    const lists = ["currentUrlList", "allCustomList"];
    lists.forEach((listId) => {
      const listElement = document.getElementById(listId);
      listElement.innerHTML = `<p class="empty-list">데이터를 불러오는데 실패했습니다.</p>`;
    });
  }

  confirmDeleteButton.addEventListener("click", async () => {
    if (!layerToDelete) return;

    try {
      await api.deleteLayer(layerToDelete);
      deleteConfirmPopup.style.display = "none";
      await loadSavedLayers();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("삭제 중 문제가 발생했습니다. 다시 시도해 주세요.");
    }
  });

  cancelDeleteButton.addEventListener("click", () => {
    deleteConfirmPopup.style.display = "none";
    layerToDelete = null;
  });
});
