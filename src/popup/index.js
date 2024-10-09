document.addEventListener("DOMContentLoaded", () => {
  const toggleHighlightSwitch = document.getElementById(
    "toggleHighlightSwitch"
  );
  const undoButton = document.getElementById("undoButton");
  const resetButton = document.getElementById("resetButton");
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
          (response) => {}
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

    if (request.action === "resetDomChanged") {
      domChanged = false;
      updateSaveButtonState();
    }
  });

  toggleLogin.addEventListener("click", () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        console.error("Login failed:", chrome.runtime.lastError);
        return;
      }
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
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
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

    fetch(
      `http://localhost:5000/api/layers/check/${encodeURIComponent(customName)}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.exists) {
          if (
            confirm("같은 이름의 저장된 레이어가 있습니다. 덮어쓰시겠습니까?")
          ) {
            proceedWithSaving();
          }
        } else {
          proceedWithSaving();
        }
      })
      .catch((error) => {
        console.error("Error checking custom name:", error);
        alert("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      });

    function proceedWithSaving() {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "saveDOMChanges",
          customName: customName,
          userId: userId,
        });
      });

      savePopup.style.display = "none";
      customNameInput.value = "";
      loadSavedLayers();
    }
  });

  cancelSaveButton.addEventListener("click", () => {
    savePopup.style.display = "none";
    customNameInput.value = "";
  });

  undoButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "undo" });
    });
  });

  resetButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "reset" });
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
          if (layers.length === 0) {
            listElement.innerHTML = `<p>${emptyMessage}</p>`;
          } else {
            layers.forEach((layer) => {
              const li = document.createElement("li");
              li.textContent =
                listElementId === "currentUrlList"
                  ? layer.customName
                  : `${layer.customName} (${layer.url})`;

              li.addEventListener("click", () => {
                console.log("레이어 클릭됨: ", layer);

                clearActiveClassFromList();
                li.classList.add("active");

                chrome.tabs.query(
                  { active: true, currentWindow: true },
                  (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                      action: "applySavedDOM",
                      modifiedDOMSnapshot: layer.modifiedDOMSnapshot,
                      elementChanges: layer.elementChanges,
                    });
                  }
                );
              });

              const deleteIcon = document.createElement("img");
              deleteIcon.src = "icons/delete_icon.png";
              deleteIcon.addEventListener("click", () => {
                deleteConfirmPopup.style.display = "block";
                layerToDelete = layer._id;
              });

              li.appendChild(deleteIcon);
              listElement.appendChild(li);
            });
          }
        })
        .catch((error) => {
          console.error(`Error loading layers from ${apiUrl}:`, error);
        });
    }

    const currentUrlApi = `http://localhost:5000/api/layers/url/${encodeURIComponent(currentUrl)}?userId=${userId}`;
    fetchLayers(currentUrlApi, "currentUrlList", "저장된 레이어가 없습니다.");

    const allCustomApi = `http://localhost:5000/api/layers/google/${userId}`;
    fetchLayers(allCustomApi, "allCustomList", "저장된 레이어가 없습니다.");
  }

  function showLoginMessage() {
    const currentUrlList = document.getElementById("currentUrlList");
    const allCustomList = document.getElementById("allCustomList");

    currentUrlList.innerHTML = "<p>로그인 해주세요.</p>";
    allCustomList.innerHTML = "<p>로그인 해주세요.</p>";
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
        console.error("Error deleting layer:", error);
        alert("삭제 중 문제가 발생했습니다. 다시 시도해 주세요.");
      });
  });

  cancelDeleteButton.addEventListener("click", () => {
    deleteConfirmPopup.style.display = "none";
    layerToDelete = null;
  });
});
