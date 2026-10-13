const API_URL = import.meta.env.VITE_API_URL;

export const api = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (response.status === 401 && token) {
    localStorage.removeItem("token");

    window.dispatchEvent(
      new CustomEvent("auth:unauthorized", {
        detail: {
          message:
            "Your session has expired. Please log in again.",
        },
      })
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
};