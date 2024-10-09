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
  let layerToDelete = null; // 삭제할 레이어를 저장할 변수

  function updateSaveButtonState() {
    saveButton.disabled = !(loggedIn && domChanged);
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

  // 로그인 상태 확인
  chrome.storage.local.get(["userId", "userName"], (result) => {
    loggedIn = !!result.userId; // 로그인 여부 확인
    domChanged = false;
    updateSaveButtonState();
    if (loggedIn) {
      userId = result.userId;
      userNameSpan.textContent = result.userName;
      document.getElementById("userInfo").style.display = "block";
      toggleLogin.style.display = "none";
      loadSavedLayers(); // 로그인된 상태면 레이어 로드
    } else {
      document.getElementById("userInfo").style.display = "none";
      toggleLogin.style.display = "block";
      showLoginMessage(); // 로그인 안된 상태면 메시지 표시
    }
  });

  // 현재 URL 가져오기
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
    showLoginMessage(); // 로그아웃 시 메시지 표시
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
        loadSavedLayers(); // 사용자 정보 로드 후 레이어 불러오기
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }

  // 레이어 저장 로직
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

  // 탭 버튼 클릭 시 이벤트 처리
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      // 모든 탭 버튼에서 active 클래스 제거
      tabButtons.forEach((btn) => btn.classList.remove("active"));

      // 클릭된 탭에만 active 클래스 추가
      button.classList.add("active");

      // 모든 탭 콘텐츠 숨김 처리
      tabContents.forEach((content) => {
        content.style.display = "none";
      });

      // 선택된 탭 콘텐츠만 표시
      document.getElementById(`${targetTab}List`).style.display = "block";

      // 탭 전환 시 저장된 레이어 불러오기
      if (loggedIn) {
        loadSavedLayers();
      } else {
        showLoginMessage();
      }
    });
  });

  // 기본적으로 첫 번째 탭을 활성화 상태로 설정
  document.getElementById("currentUrlList").style.display = "block";

  function loadSavedLayers() {
    if (!userId) return;

    // 현재 URL과 일치하는 레이어 불러오기
    fetch(
      `http://localhost:5000/api/layers/url/${encodeURIComponent(currentUrl)}?userId=${userId}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("404 Not Found");
        }
        return response.json();
      })
      .then((layers) => {
        const currentUrlList = document.getElementById("currentUrlList");
        currentUrlList.innerHTML = "";
        if (layers.length === 0) {
          currentUrlList.innerHTML = "<p>저장된 레이어가 없습니다.</p>"; // 빈 상태 표시
        } else {
          layers.forEach((layer) => {
            const li = document.createElement("li");
            li.textContent = layer.customName;
            const deleteIcon = document.createElement("img");
            deleteIcon.src = "icons/delete_icon.png";
            deleteIcon.addEventListener("click", () => {
              deleteConfirmPopup.style.display = "block";
              layerToDelete = layer._id; // 삭제할 레이어 ID 저장
            });
            li.appendChild(deleteIcon);
            currentUrlList.appendChild(li);
          });
        }
      })
      .catch((error) => {
        console.error("Error loading current custom links:", error);
      });

    // 모든 레이어 불러오기
    fetch(`http://localhost:5000/api/layers/google/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("404 Not Found");
        }
        return response.json();
      })
      .then((layers) => {
        const allCustomList = document.getElementById("allCustomList");
        allCustomList.innerHTML = "";
        if (layers.length === 0) {
          allCustomList.innerHTML = "<p>저장된 레이어가 없습니다.</p>"; // 빈 상태 표시
        } else {
          layers.forEach((layer) => {
            const li = document.createElement("li");
            li.textContent = `${layer.customName} (${layer.url})`;
            const deleteIcon = document.createElement("img");
            deleteIcon.src = "icons/delete_icon.png";
            deleteIcon.addEventListener("click", () => {
              deleteConfirmPopup.style.display = "block";
              layerToDelete = layer._id; // 삭제할 레이어 ID 저장
            });
            li.appendChild(deleteIcon);
            allCustomList.appendChild(li);
          });
        }
      })
      .catch((error) => {
        console.error("Error loading all custom links:", error);
      });
  }

  // 로그인 상태가 아닐 때 표시할 메시지
  function showLoginMessage() {
    const currentUrlList = document.getElementById("currentUrlList");
    const allCustomList = document.getElementById("allCustomList");

    currentUrlList.innerHTML = "<p>로그인 해주세요.</p>";
    allCustomList.innerHTML = "<p>로그인 해주세요.</p>";
  }

  // 삭제 확인 팝업에서 "삭제" 버튼을 클릭했을 때
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
        deleteConfirmPopup.style.display = "none"; // 삭제 팝업 숨기기
        loadSavedLayers(); // 레이어 목록 갱신
      })
      .catch((error) => {
        console.error("Error deleting layer:", error);
        alert("삭제 중 문제가 발생했습니다. 다시 시도해 주세요.");
      });
  });

  // 삭제 취소 버튼 클릭 시 팝업 숨기기
  cancelDeleteButton.addEventListener("click", () => {
    deleteConfirmPopup.style.display = "none";
    layerToDelete = null; // 삭제할 레이어 ID 초기화
  });
});
