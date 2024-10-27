import { formatDate } from "../common/utils";

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
  let domChanged = false;
  let loggedIn = false;
  let layerToDelete = null;
  let domChangesData = null;

  function updateSaveButtonState() {
    saveButton.disabled = !(loggedIn && domChanged);
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

  chrome.storage.local.get(["userId", "userName"], (result) => {
    loggedIn = !!result.userId;
    domChanged = false;
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
  });

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "domChanged") {
      domChanged = true;
      updateSaveButtonState();
    }
    if (request.action === "saveDOMChanges") {
      saveToAPI(request.data);
      sendResponse({ status: "DOM changes received in popup" });
    }
  });

  toggleLogin.addEventListener("click", () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) return;
      fetchUserData(token);
    });
  });

  logoutButton.addEventListener("click", () => {
    userId = null;
    chrome.storage.local.remove(["userId", "userName"]);
    document.getElementById("userInfo").style.display = "none";
    toggleLogin.style.display = "block";
    updateSaveButtonState();
    showLoginMessage();
  });

  function fetchUserData(token) {
    fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((user) => {
        userId = user.id;
        loggedIn = true;
        userNameSpan.textContent = user.name;
        document.getElementById("userInfo").style.display = "block";
        toggleLogin.style.display = "none";

        chrome.storage.local.set({ userId: user.id, userName: user.name });
        updateSaveButtonState();
        loadSavedLayers();
      })
      .catch((error) => {});
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

  function checkDuplicateName(customName) {
    return fetch(
      `http://localhost:5000/api/layers/check/${encodeURIComponent(customName)}`
    )
      .then((response) => response.json())
      .then((data) => data.exists)
      .catch((error) => {
        throw error;
      });
  }

  function requestDOMChanges(customName) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const url = currentTab.url;
      chrome.tabs.sendMessage(
        currentTab.id,
        { action: "saveDOMChanges", customName, userId, url },
        {},
        (response) => {
          if (response && response.status === "success" && response.data) {
            const { saveDOMChanges } = response.data;
            saveToAPI({
              elementChanges: saveDOMChanges,
              customName,
              userId,
              url,
            });
          } else {
            alert("DOM 데이터 전송 중 오류가 발생했습니다.");
          }
        }
      );
    });
  }

  function saveToAPI(data) {
    const { customName, userId, url, elementChanges } = data;
    fetch("http://localhost:5000/api/layers/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`,
      },
      body: JSON.stringify({ customName, url, elementChanges, userId }),
    })
      .then((response) => response.json())
      .then(() => {
        loadSavedLayers();
        alert("Changes saved successfully!");
      })
      .catch((error) => {});
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

  function loadSavedLayers() {
    if (!userId) return;

    function fetchCurrentUrlLayers() {
      const currentUrlApi = `http://localhost:5000/api/layers/url/${encodeURIComponent(currentUrl)}?userId=${userId}`;
      fetchLayers(currentUrlApi, "currentUrlList", "저장된 콘텐츠가 없습니다.");
    }

    function fetchAllCustomLayers() {
      const allCustomApi = `http://localhost:5000/api/layers/google/${userId}`;
      fetchLayers(allCustomApi, "allCustomList", "저장된 콘텐츠가 없습니다.");
    }

    function fetchLayers(apiUrl, listElementId, emptyMessage) {
      return fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("404 Not Found");
          }
          return response.json();
        })
        .then((layers) => {
          const listElement = document.getElementById(listElementId);
          listElement.innerHTML = "";
          if (!layers || layers.length === 0) {
            listElement.innerHTML = `<p class="empty-list">${emptyMessage}</p>`;
          } else {
            layers.forEach((layer) => {
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

                  chrome.tabs.query(
                    { active: true, currentWindow: true },
                    (tabs) => {
                      chrome.tabs.sendMessage(tabs[0].id, {
                        action: "applySavedDOM",
                        elementChanges: layer.elementChanges,
                      });
                    }
                  );
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
                li.addEventListener("click", () => {
                  navigator.clipboard
                    .writeText(layer.url)
                    .then(() => {
                      alert(`URL이 복사되었습니다: ${layer.url}`);
                    })
                    .catch((err) => {});
                });
              }

              const deleteIcon = li.querySelector(".delete-icon");
              deleteIcon.addEventListener("click", (event) => {
                event.stopPropagation();
                deleteConfirmPopup.style.display = "block";
                layerToDelete = layer._id;
              });

              listElement.appendChild(li);
            });
          }
        })
        .catch((error) => {
          const listElement = document.getElementById(listElementId);
          listElement.innerHTML = `<p>${emptyMessage}</p>`;
        });
    }

    fetchCurrentUrlLayers();
    fetchAllCustomLayers();
  }

  function showLoginMessage() {
    const currentUrlList = document.getElementById("currentUrlList");
    const allCustomList = document.getElementById("allCustomList");

    currentUrlList.innerHTML = `<p class="empty-list">로그인 해주세요.</p>`;
    allCustomList.innerHTML = `<p class="empty-list">로그인 해주세요.</p>`;
  }

  confirmDeleteButton.addEventListener("click", () => {
    if (!layerToDelete) return;
    fetch(`http://localhost:5000/api/layers/delete/${layerToDelete}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to delete layer: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        deleteConfirmPopup.style.display = "none";
        loadSavedLayers();
      })
      .catch((error) => {
        alert("삭제 중 문제가 발생했습니다. 다시 시도해 주세요.");
      });
  });

  cancelDeleteButton.addEventListener("click", () => {
    deleteConfirmPopup.style.display = "none";
    layerToDelete = null;
  });
});
