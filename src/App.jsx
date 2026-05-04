import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f14",
          color: "#6c63ff",
          fontSize: 18,
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  // Not logged in → show auth page
  if (!user) return <AuthPage />;

  // Logged in → wrap with chat context and show chat
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}