// utils/api.js
export const API_URL = "http://localhost:3000";

export const getToken = () => localStorage.getItem("token");

export const fetchWithAuth = async (url, options = {}) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const headers = {
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${url}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Error");

    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
