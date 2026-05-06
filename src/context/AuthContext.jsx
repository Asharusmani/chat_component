import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister } from "../../api/chat/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser  = localStorage.getItem("chat_user");
    const savedToken = localStorage.getItem("chat_token");
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        console.log("[AUTH] Session restored from localStorage");
      } catch {
        localStorage.removeItem("chat_user");
        localStorage.removeItem("chat_token");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Sign up — calls POST /api/auth/register
   */
  const signUp = async (firstName, lastName, email, password) => {
    try {
      const res = await apiRegister({
        firstName,
        lastName,
        email,
        password,
        confirmPassword: password,
      });

      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Registration failed");
      }

      const { token, refreshToken, user: newUser } = res.data;

      if (!token || !newUser) {
        throw new Error("Invalid response from server");
      }

      const enriched = {
        ...newUser,
        avatar: newUser.avatarUrl || `${firstName[0]}${lastName[0]}`.toUpperCase(),
      };

      localStorage.setItem("chat_token", token);
      localStorage.setItem("chat_refresh_token", refreshToken);
      localStorage.setItem("chat_user", JSON.stringify(enriched));
      setUser(enriched);

      console.log("[AUTH] Registered:", enriched.email, "| username:", enriched.username);
      return enriched;

    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      console.error("[AUTH] Register error:", msg);
      throw new Error(msg);
    }
  };

  /**
   * Sign in — calls POST /api/auth/login
   */
  const signIn = async (email, password) => {
    try {
      const res = await apiLogin(email, password);

      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Login failed");
      }

      const { token, refreshToken, user: loggedIn } = res.data;

      if (!token || !loggedIn) {
        throw new Error("Invalid response from server");
      }

      const enriched = {
        ...loggedIn,
        avatar: loggedIn.avatarUrl || loggedIn.username?.slice(0, 2).toUpperCase(),
      };

      localStorage.setItem("chat_token", token);
      localStorage.setItem("chat_refresh_token", refreshToken);
      localStorage.setItem("chat_user", JSON.stringify(enriched));
      setUser(enriched);

      console.log("[AUTH] Signed in:", enriched.email, "| username:", enriched.username);
      return enriched;

    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      console.error("[AUTH] Login error:", msg);
      throw new Error(msg);
    }
  };

  /**
   * Sign out
   */
  const signOut = () => {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_refresh_token");
    localStorage.removeItem("chat_user");
    setUser(null);
    console.log("[AUTH] Signed out");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);