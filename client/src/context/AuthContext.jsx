import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const interceptorRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    // Eject interceptor on logout to avoid memory leaks
    if (interceptorRef.current !== null) {
      axios.interceptors.response.eject(interceptorRef.current);
    }
  }, []);

  const setupInterceptor = useCallback(
    (accessToken, refreshToken) => {
      // Eject any existing interceptor before setting a new one
      if (interceptorRef.current !== null) {
        axios.interceptors.response.eject(interceptorRef.current);
      }

      interceptorRef.current = axios.interceptors.response.use(
        (response) => response, // Pass through successful responses
        async (error) => {
          const originalRequest = error.config;

          // Only attempt refresh on 401 and if we haven't already retried
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
              const res = await axios.post("/api/auth/refresh", {
                refreshToken,
              });

              const newAccessToken = res.data.data.accessToken;
              const newRefreshToken =
                res.data.data.refreshToken ?? refreshToken;

              // Persist new tokens
              localStorage.setItem("accessToken", newAccessToken);
              localStorage.setItem("refreshToken", newRefreshToken);

              // Update the default header and retry the original request
              axios.defaults.headers.common["Authorization"] =
                `Bearer ${newAccessToken}`;
              originalRequest.headers["Authorization"] =
                `Bearer ${newAccessToken}`;

              // Re-setup interceptor with the new tokens
              setupInterceptor(newAccessToken, newRefreshToken);

              return axios(originalRequest);
            } catch (refreshError) {
              // Refresh failed — force logout
              logout();
              return Promise.reject(refreshError);
            }
          }

          return Promise.reject(error);
        },
      );
    },
    [logout],
  );

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (stored && accessToken && refreshToken) {
      try {
        setUser(JSON.parse(stored));
        // Set default auth header for all axios requests
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;
        setupInterceptor(accessToken, refreshToken);
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, [setupInterceptor]);

  const login = useCallback(
    (userData, accessToken, refreshToken) => {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));
      // Set default auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      setUser(userData);
      setupInterceptor(accessToken, refreshToken);
    },
    [setupInterceptor],
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
