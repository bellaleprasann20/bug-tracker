
import { useAuth as useAuthContext } from "../context/AuthContext";

export default function useAuth() {
  const auth = useAuthContext();

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
  };
}
