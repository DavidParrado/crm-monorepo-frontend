import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

/**
 * Gets the auth token from Zustand and returns the auth header.
 */
const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  if (!token) {
    console.error("No auth token found for API request");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Centralized response handler for all fetch calls.
 * Handles JSON, Blobs, empty responses, and errors.
 */
const handleResponse = async (response: Response) => {
  // 1. Check for errors
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || "Ocurrió un error en la solicitud");
    } catch (parseError) {
      // If JSON parsing fails, throw generic error
      throw new Error("Ocurrió un error en la solicitud");
    }
  }

  // 2. Handle empty (204 No Content) responses (e.g., from a DELETE)
  if (response.status === 204) {
    return;
  }

  // 3. Handle Blob responses (for file exports)
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") || contentType?.includes("application/octet-stream")) {
    return response.blob();
  }

  // 4. Check if response has content
  const text = await response.text();
  if (!text || text.length === 0) {
    return;
  }

  // 5. Parse JSON response
  try {
    return JSON.parse(text);
  } catch {
    // If not JSON, return as is
    return text;
  }
};

/**
 * The single, centralized HTTP client (adapter) for the entire application.
 */
export const http = {
  /**
   * Performs a GET request.
   * @param endpoint The URL path (e.g., "clients")
   * @param params Optional URLSearchParams to append
   */
  get: <TResponse>(endpoint: string, params?: URLSearchParams): Promise<TResponse> => {
    const url = new URL(`${API_URL}/${endpoint}`);
    if (params) {
      url.search = params.toString();
    }

    return fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeader(),
    }).then(handleResponse);
  },

  /**
   * Performs a POST request.
   * @param endpoint The URL path (e.g., "appointments")
   * @param data The request body data
   */
  post: <TResponse, TRequest = unknown>(endpoint: string, data: TRequest): Promise<TResponse> => {
    return fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    }).then(handleResponse);
  },

  /**
   * Performs a PATCH request.
   * @param endpoint The URL path (e.g., "appointments/1")
   * @param data The request body data
   */
  patch: <TResponse, TRequest = unknown>(endpoint: string, data: TRequest): Promise<TResponse> => {
    return fetch(`${API_URL}/${endpoint}`, {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    }).then(handleResponse);
  },

  /**
   * Performs a DELETE request.
   * @param endpoint The URL path (e.g., "appointments/1")
   */
  del: <TResponse = void>(endpoint: string): Promise<TResponse> => {
    return fetch(`${API_URL}/${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    }).then(handleResponse);
  },
  
  /**
   * Performs a POST request and expects a Blob response (e.g., file export).
   * @param endpoint The URL path
   * @param data The request body data
   */
  postBlob: <TRequest = unknown>(endpoint: string, data: TRequest): Promise<Blob> => {
    return fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    }).then(handleResponse);
  },

  /**
   * Performs a POST request with FormData (for file uploads).
   * @param endpoint The URL path (e.g., "imports/parse-preview")
   * @param data The FormData object to send
   */
  postForm: <TResponse>(endpoint: string, data: FormData): Promise<TResponse> => {
    const token = useAuthStore.getState().token;
    
    return fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        // NO 'Content-Type' header. The browser sets it correctly for FormData.
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    }).then(handleResponse);
  }
};
