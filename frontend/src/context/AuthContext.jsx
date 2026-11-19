
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  login as loginRequest,
  register as registerRequest,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "access_token";

const getResponseData = (response) =>
  response?.data ?? response;

const getAccessToken = (response) => {
  const data = getResponseData(response);

  return (
    data?.access_token ||
    data?.token ||
    data?.data?.access_token ||
    null
  );
};

const getUserFromResponse = (response) => {
  const data = getResponseData(response);

  return (
    data?.user ||
    data?.data?.user ||
    null
  );
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  // Check the saved token when the application starts.
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await getCurrentUser();
      const currentUser = getUserFromResponse(response) || getResponseData(response);

      if (!currentUser?.id) {
        throw new Error("Invalid user response.");
      }

      setUser(currentUser);
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Login existing user.
  const login = useCallback(async (credentials) => {
    const response = await loginRequest(credentials);
    const token = getAccessToken(response);

    if (!token) {
      throw new Error("Login response did not contain an access token.");
    }

    localStorage.setItem(TOKEN_KEY, token);

    try {
      const responseUser = getUserFromResponse(response);

      if (responseUser?.id) {
        setUser(responseUser);
        return responseUser;
      }

      const currentUserResponse = await getCurrentUser();
      const currentUser =
        getUserFromResponse(currentUserResponse) ||
        getResponseData(currentUserResponse);

      if (!currentUser?.id) {
        throw new Error("Unable to retrieve your user profile.");
      }

      setUser(currentUser);
      return currentUser;
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      throw error;
    }
  }, []);

  // Register a new user, then log them in.
  const register = useCallback(async (userData) => {
    await registerRequest(userData);

    return login({
      email: userData.email,
      password: userData.password,
    });
  }, [login]);

  // Logout current user.
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      loadUser,
    }),
    [
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      loadUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom context hook.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
}

export default AuthContext;
