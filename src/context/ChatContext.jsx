import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [contacts] = useState([
    { id: "user_ar", username: "Ali Raza",     avatar: "AR", online: true  },
    { id: "user_sk", username: "Sara Khan",    avatar: "SK", online: true  },
    { id: "user_mf", username: "M. Farhan",    avatar: "MF", online: false },
    { id: "user_zh", username: "Zara Hussain", avatar: "ZH", online: true  },
  ]);

  const [activeDMId, setActiveDMId] = useState("user_ar");

  // All messages across all DMs — each message has senderId + receiverId
  const [allMessages, setAllMessages] = useState([
    {
      id: "m1",
      senderId: "user_ar",
      receiverId: "__ME__",        // replaced at render time with user.id
      senderName: "Ali Raza",
      senderAvatar: "AR",
      content: "Salam! Kya haal hai?",
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: "m2",
      senderId: "__ME__",
      receiverId: "user_ar",
      senderName: "",              // filled at render time
      senderAvatar: "",
      content: "Bilkul theek, shukria! Tum batao?",
      timestamp: new Date(Date.now() - 240000).toISOString(),
    },
    {
      id: "m3",
      senderId: "user_ar",
      receiverId: "__ME__",
      senderName: "Ali Raza",
      senderAvatar: "AR",
      content: "React ka naya project shuru kiya hai",
      timestamp: new Date(Date.now() - 180000).toISOString(),
    },
    {
      id: "s1",
      senderId: "user_sk",
      receiverId: "__ME__",
      senderName: "Sara Khan",
      senderAvatar: "SK",
      content: "Kya aap kal meeting mein honge?",
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: "s2",
      senderId: "__ME__",
      receiverId: "user_sk",
      senderName: "",
      senderAvatar: "",
      content: "Haan, main hounga InshAllah",
      timestamp: new Date(Date.now() - 540000).toISOString(),
    },
    {
      id: "z1",
      senderId: "user_zh",
      receiverId: "__ME__",
      senderName: "Zara Hussain",
      senderAvatar: "ZH",
      content: "Code review kar diya?",
      timestamp: new Date(Date.now() - 900000).toISOString(),
    },
  ]);

  // Resolve __ME__ placeholders to the real user id
  const resolveMessages = (msgs) =>
    msgs.map((m) => ({
      ...m,
      senderId:   m.senderId   === "__ME__" ? user?.id : m.senderId,
      receiverId: m.receiverId === "__ME__" ? user?.id : m.receiverId,
      senderName:   m.senderId === "__ME__" ? user?.username  : m.senderName,
      senderAvatar: m.senderId === "__ME__" ? user?.avatar    : m.senderAvatar,
    }));

  // Messages for the currently open DM
  const dmMessages = resolveMessages(allMessages).filter(
    (m) =>
      (m.senderId === user?.id && m.receiverId === activeDMId) ||
      (m.senderId === activeDMId && m.receiverId === user?.id)
  );

  // Last message per contact (for sidebar preview)
  const getLastMessage = (contactId) => {
    const msgs = resolveMessages(allMessages).filter(
      (m) =>
        (m.senderId === user?.id && m.receiverId === contactId) ||
        (m.senderId === contactId && m.receiverId === user?.id)
    );
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  };

  // Unread count per contact
  const getUnreadCount = (contactId) => {
    if (contactId === activeDMId) return 0;
    return resolveMessages(allMessages).filter(
      (m) => m.senderId === contactId && m.receiverId === user?.id && !m.read
    ).length;
  };

  const sendMessage = useCallback(
    (content) => {
      if (!user || !content.trim() || !activeDMId) return;
      const newMsg = {
        id: `msg_${Date.now()}`,
        senderId:     user.id,
        receiverId:   activeDMId,
        senderName:   user.username,
        senderAvatar: user.avatar,
        content:      content.trim(),
        timestamp:    new Date().toISOString(),
        read:         true,
      };
      setAllMessages((prev) => [...prev, newMsg]);
      console.log(`[MSG] To: ${activeDMId} | From: ${user.id} | "${content.trim()}"`);
      return newMsg;
    },
    [user, activeDMId]
  );

  const switchDM = (contactId) => {
    // Mark incoming messages from this contact as read
    setAllMessages((prev) =>
      prev.map((m) =>
        m.senderId === contactId && (m.receiverId === user?.id || m.receiverId === "__ME__")
          ? { ...m, read: true }
          : m
      )
    );
    setActiveDMId(contactId);
    console.log("[CHAT] Switched DM to:", contactId);
  };

  return (
    <ChatContext.Provider
      value={{
        contacts,
        activeDMId,
        dmMessages,
        getLastMessage,
        getUnreadCount,
        sendMessage,
        switchDM,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);