chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});
let isLoginInProgress = false;

async function completeLogout() {
  await chrome.identity.clearAllCachedAuthTokens();
  await chrome.storage.local.clear();
  chrome.runtime.sendMessage({
    action: "logoutComplete",
    message:
      "로그아웃되었습니다. Google 계정에서도 완전히 로그아웃하려면 https://accounts.google.com에서 수동으로 로그아웃해주세요.",
  });
}

async function revokeToken(token) {
  try {
    await chrome.identity.removeCachedAuthToken({ token });
    const response = await fetch(
      `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    if (!response.ok) throw new Error("Token revocation failed");
  } catch (error) {
    console.error("Error revoking token:", error);
    throw error;
  }
}

async function googleLogin() {
  if (isLoginInProgress) {
    return { success: false, message: "로그인 진행 중" };
  }

  isLoginInProgress = true;

  try {
    const existingToken = await new Promise((resolve) =>
      chrome.identity.getAuthToken({ interactive: false }, resolve)
    );
    if (existingToken) await revokeToken(existingToken);
    await proceedWithLogin();
    isLoginInProgress = false;
    chrome.runtime.sendMessage({ action: "loginComplete" });
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    isLoginInProgress = false;
    return { success: false, message: error.message };
  }
}

function proceedWithLogin() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&redirect_uri=${encodeURIComponent(chrome.identity.getRedirectURL())}&response_type=token&client_id=${encodeURIComponent(process.env.CLIENT_ID)}&prompt=select_account`;

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      (redirectUrl) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (!redirectUrl) {
          reject(new Error("No redirect URL"));
        } else {
          handleAuthResponse(redirectUrl);
          resolve();
        }
      }
    );
  });
}

function handleAuthResponse(redirectUrl) {
  const accessToken = new URLSearchParams(redirectUrl.split("#")[1]).get(
    "access_token"
  );
  if (!accessToken) {
    console.error("No access token found in the redirect URL");
    return;
  }
  fetchUserInfo(accessToken);
}

async function fetchUserInfo(accessToken) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
    );
    if (!response.ok) throw new Error("Failed to fetch user info");
    const data = await response.json();
    await chrome.storage.local.set({ user: data, accessToken });
    chrome.runtime.sendMessage({ action: "updateUser", userName: data.name });
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
}

async function googleLogout() {
  try {
    const token = await new Promise((resolve) =>
      chrome.identity.getAuthToken({ interactive: false }, resolve)
    );
    if (token) await revokeToken(token);
    await completeLogout();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

async function completeLogout() {
  await chrome.identity.clearAllCachedAuthTokens();
  await chrome.storage.local.clear();
  chrome.runtime.sendMessage({
    action: "updateUser",
    userName: "",
    message:
      "로그아웃되었습니다. Google 계정에서도 완전히 로그아웃하려면 https://accounts.google.com에서 수동으로 로그아웃해주세요.",
  });
}

function handleLayerChanged(request) {
  chrome.storage.local.set({
    layerChanged: {
      canSave: request.canSave,
      changeCount: request.changeCount,
    },
  });
  chrome.runtime.sendMessage(
    {
      action: "layerChanged",
      canSave: request.canSave,
      changeCount: request.changeCount,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.log("Popup not available, state saved to storage");
      }
    }
  );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchLayers") {
    fetch(
      `http://localhost:5000/api/layers/${request.googleUserId}?page=${request.page}&limit=${request.limit}`
    )
      .then((response) => {
        if (response.headers.get("content-type").includes("application/json")) {
          return response.json();
        } else {
          throw new Error("API가 HTML 페이지를 반환했습니다.");
        }
      })
      .then((data) => {
        sendResponse({
          success: true,
          layers: data.layers,
          currentPage: data.currentPage,
          totalPages: data.totalPages,
        });
      })
      .catch((error) => {
        console.error("API Get Error :", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "fetchLayerById") {
    fetch(`http://localhost:5000/api/layers/layer/${request.layerId}`)
      .then((response) => {
        if (response.headers.get("content-type").includes("application/json")) {
          return response.json();
        } else {
          throw new Error("API가 HTML 페이지를 반환했습니다.");
        }
      })
      .then((data) => {
        sendResponse({ success: true, layer: data });
      })
      .catch((error) => {
        console.error("API Get Layer Error :", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  const actions = {
    login: () => {
      googleLogin().then(sendResponse);
      return true;
    },
    logout: () => {
      googleLogout().then(() => {
        sendResponse({ success: true });
      });
      return true;
    },
    layerChanged: () => handleLayerChanged(request),
  };

  if (actions[request.action]) {
    return actions[request.action]();
  }
});
