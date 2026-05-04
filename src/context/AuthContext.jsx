import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("chat_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      console.log("[AUTH] Session restored:", parsed);
    }
    setLoading(false);
  }, []);

  const signUp = async (username, email, password) => {
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      email,
      avatar: username.slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("chat_user", JSON.stringify(newUser));
    setUser(newUser);
    console.log("[AUTH] New user registered:", newUser);
    return newUser;
  };

  const signIn = async (email, password) => {
    const mockUser = {
      id: `user_mock_${email.split("@")[0]}`,
      username: email.split("@")[0],
      email,
      avatar: email.slice(0, 2).toUpperCase(),
    };
    localStorage.setItem("chat_user", JSON.stringify(mockUser));
    setUser(mockUser);
    console.log("[AUTH] User signed in:", mockUser);
    return mockUser;
  };

  const signOut = () => {
    localStorage.removeItem("chat_user");
    setUser(null);
    console.log("[AUTH] User signed out");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);