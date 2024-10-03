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

  let userId = null;
  let currentUrl = null;
  let domChanged = false;
  let loggedIn = false;

  chrome.storage.local.get(["userId", "userName"], (result) => {
    loggedIn = !!result.userId;
    domChanged = false;
    updateSaveButtonState();

    if (result.userId) {
      userId = result.userId;
      userNameSpan.textContent = result.userName;
      document.getElementById("userInfo").style.display = "block";
      toggleLogin.style.display = "none";
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = new URL(tabs[0].url).href;

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

        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: updateLayerHighlight,
          args: [isActive],
        });
      });
    });
  });

  function updateSaveButtonState() {
    saveButton.disabled = !(loggedIn && domChanged);
  }

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
      });
  }

  function updateSaveButtonState() {
    saveButton.disabled = !(loggedIn && domChanged);
  }

  saveButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "save" });
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const customName = customNameInput.value.trim();
    if (!customName) {
      alert("이름을 입력해주세요.");
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: getDOMSnapshot,
        },
        (result) => {
          const domSnapshot = result[0].result;
          saveLayerData(customName, domSnapshot);
        }
      );
    });
  });

  function saveLayerData(customName, domSnapshot) {
    fetch("http://localhost:5000/api/layers/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`,
      },
      body: JSON.stringify(),
    })
      .then((res) => res.json())
      .then((data) => {
        domChanged = false;
        updateSaveButtonState();
        loadSavedLayers();
      })
      .catch((err) => {});
  }

  function updateLayerHighlight(isActive) {
    if (window.location.href.includes("popup.html")) {
      return;
    }

    if (isActive) {
      document.querySelectorAll("*").forEach((el) => {
        if (el.childNodes.length > 0 || el.nodeName === "DIV") {
          el.classList.add("highlight-border");
        }
      });
    } else {
      document.querySelectorAll("*").forEach((el) => {
        el.classList.remove("highlight-border");
      });
    }
  }

  function getDOMSnapshot() {
    const domSnapshot = document.documentElement.outerHTML;
    return domSnapshot;
  }

  function notifyDOMChanged() {
    chrome.runtime.sendMessage({ action: "domChanged" });
  }

  undoButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "undo" });
  });

  resetButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "reset" });
  });

  function updateUndoRedoButtons() {
    undoButton.disabled = !hasUndoAction();
    resetButton.disabled = !hasResetAction();
  }
});

function updateLayerHighlight(isActive) {
  if (isActive) {
    document.querySelectorAll("*").forEach((el) => {
      if (el.children.length > 0 || el.textContent.trim() === "") {
        el.style.outline = "none";
      }
    });
  } else {
    document.querySelectorAll("*").forEach((el) => {
      el.style.outline = "none";
    });
  }
}
