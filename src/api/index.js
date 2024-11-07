const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ENDPOINTS = {
  LAYERS: {
    SAVE: "/layers/save",
    CHECK_DUPLICATE: "/layers/check",
    GET_BY_URL: "/layers/url",
    GET_ALL: "/layers/google",
    DELETE: "/layers/delete",
  },
};

const fetchAPI = async (endpoint, options = {}, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${error.message}`);
    throw error;
  }
};

export const saveLayer = async (data) => {
  const { customName, userId, url, elementChanges } = data;
  return fetchAPI(
    ENDPOINTS.LAYERS.SAVE,
    {
      method: "POST",
      body: JSON.stringify({ customName, url, elementChanges, userId }),
    },
    userId
  );
};

export const checkDuplicateName = async (customName) => {
  const response = await fetchAPI(
    `${ENDPOINTS.LAYERS.CHECK_DUPLICATE}/${encodeURIComponent(customName)}`
  );
  return response.exists;
};

export const getLayersByUrl = async (url, userId) => {
  return fetchAPI(
    `${ENDPOINTS.LAYERS.GET_BY_URL}/${encodeURIComponent(url)}?userId=${userId}`
  );
};

export const getAllLayers = async (userId) => {
  return fetchAPI(`${ENDPOINTS.LAYERS.GET_ALL}/${userId}`);
};

export const deleteLayer = async (layerId) => {
  return fetchAPI(`${ENDPOINTS.LAYERS.DELETE}/${layerId}`, {
    method: "DELETE",
  });
};

export const fetchUserInfo = async (token) => {
  try {
    const response = await fetch(import.meta.env.VITE_GOOGLE_OAUTH2, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

export const api = {
  saveLayer,
  checkDuplicateName,
  getLayersByUrl,
  getAllLayers,
  deleteLayer,
  fetchUserInfo,
};
