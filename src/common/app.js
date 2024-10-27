const API_BASE_URL = "http://localhost:5000/api";

const ENDPOINTS = {
  LAYERS: {
    SAVE: "/layers/save",
    CHECK_DUPLICATE: "/layers/check",
    GET_BY_URL: "/layers/url",
    GET_ALL: "/layers/google",
    DELETE: "/layers/delete",
  },
};

const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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
  return fetchAPI(ENDPOINTS.LAYERS.SAVE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify({ customName, url, elementChanges, userId }),
  });
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
  return fetchAPI("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const api = {
  saveLayer,
  checkDuplicateName,
  getLayersByUrl,
  getAllLayers,
  deleteLayer,
  fetchUserInfo,
};
