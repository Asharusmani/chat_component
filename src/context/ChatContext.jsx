import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  getUserConversations,
  createConversation,
  markConversationAsRead,
  getConversationMessages,
  sendMessage as apiSendMessage,
} from "../../api/chat/chatApi";

const ChatContext = createContext(null);

// BigInt/String/Number safe comparison
const sameId = (a, b) => String(a) === String(b);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [conversations, setConversations]               = useState([]);
  const [contacts, setContacts]                         = useState([]);
  const [activeDMId, setActiveDMId]                     = useState(null);
  const [activeContactId, setActiveContactId]           = useState(null);
  const [dmMessages, setDmMessages]                     = useState([]);
  const [messagesLoading, setMessagesLoading]           = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  const activeDMIdRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  const loadConversations = async (keepActive = false) => {
    try {
      setConversationsLoading(true);
      const res = await getUserConversations();
      const convList = res.data || [];
      setConversations(convList);

      const shaped = convList.map((conv) => {
        const other = sameId(conv.userOne?.id, user.id) ? conv.userTwo : conv.userOne;
        return {
          id:            conv.id,
          contactId:     other?.id,
          username:      other?.username || "Unknown",
          avatarUrl:     other?.avatarUrl || null,
          avatar:        other?.username?.slice(0, 2).toUpperCase() || "??",
          online:        other?.isOnline || false,
          lastSeen:      other?.lastSeen || null,
          lastMessage:   conv.lastMessage || null,
          lastMessageAt: conv.lastMessageAt,
          unread:        conv.unreadCount ?? 0,
        };
      });

      setContacts(shaped);

      // Sirf pehli baar auto-select karo (keepActive=true par skip)
      if (!keepActive && shaped.length > 0 && !activeDMIdRef.current) {
        activeDMIdRef.current = shaped[0].id;
        setActiveDMId(shaped[0].id);
        setActiveContactId(shaped[0].contactId);
      }

      console.log(`[CHAT] Loaded ${shaped.length} conversations`);
      return shaped;
    } catch (err) {
      console.error("[CHAT] Failed to load conversations:", err.message);
      return [];
    } finally {
      setConversationsLoading(false);
    }
  };

  // Messages load karo jab activeDMId badal jay
  useEffect(() => {
    if (!activeDMId) return;
    loadMessages(activeDMId);
  }, [activeDMId]);

  const loadMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      setDmMessages([]);

      const res = await getConversationMessages(conversationId, { limit: 50 });
      // API directly array return karta hai res.data mein
      const msgs = Array.isArray(res.data) ? res.data : [];

      const shaped = msgs.map((m) => ({
        id:              m.id,
        senderId:        m.senderId,
        senderName:      m.sender?.username || "",
        senderAvatarUrl: m.sender?.avatarUrl || null,
        senderAvatar:    m.sender?.username?.slice(0, 2).toUpperCase() || "??",
        content:         m.body,
        timestamp:       m.createdAt,
        isEdited:        m.isEdited,
        isDeleted:       m.isDeleted,
        replyToId:       m.replyToId,
        type:            m.type,
        reactions:       m.reactions || [],
        status:          m.status?.status || m.status || null,
      }));

      setDmMessages(shaped);
      console.log(`[CHAT] Loaded ${shaped.length} messages for conv ${conversationId}`);
    } catch (err) {
      console.error("[CHAT] Failed to load messages:", err.message);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = useCallback(
    async (content) => {
      if (!user || !content.trim() || !activeDMId) return;

      const tempId = `temp_${Date.now()}`;
      const optimistic = {
        id:              tempId,
        senderId:        user.id,
        senderName:      user.username,
        senderAvatarUrl: user.avatarUrl || null,
        senderAvatar:    user.username?.slice(0, 2).toUpperCase() || "??",
        content:         content.trim(),
        timestamp:       new Date().toISOString(),
        type:            "text",
        reactions:       [],
        status:          "sending",
      };
      setDmMessages((prev) => [...prev, optimistic]);

      try {
        const clientMessageId = `cmid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const res = await apiSendMessage(activeDMId, {
          body: content.trim(),
          type: "text",
          clientMessageId,
        });
        const saved = res.data;

        setDmMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...optimistic, id: saved.id, timestamp: saved.createdAt, status: "sent" }
              : m
          )
        );

        setContacts((prev) =>
          prev.map((c) =>
            sameId(c.id, activeDMId)
              ? { ...c, lastMessage: { body: content.trim() }, lastMessageAt: saved.createdAt }
              : c
          )
        );

        console.log(`[MSG] Sent: "${content.trim()}"`);
        return saved;
      } catch (err) {
        setDmMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
        );
        console.error("[MSG] Send failed:", err.message);
        throw err;
      }
    },
    [user, activeDMId]
  );

  const switchDM = useCallback(async (conversationId) => {
    // String comparison — BigInt safe
    if (sameId(activeDMIdRef.current, conversationId)) return;

    const contact = contacts.find((c) => sameId(c.id, conversationId));
    activeDMIdRef.current = conversationId;
    setActiveDMId(conversationId);
    setActiveContactId(contact?.contactId || null);

    // Unread badge immediately clear karo
    setContacts((prev) =>
      prev.map((c) => (sameId(c.id, conversationId) ? { ...c, unread: 0 } : c))
    );

    try {
      await markConversationAsRead(conversationId);
    } catch (err) {
      console.warn("[CHAT] markConversationAsRead:", err.message);
    }
    console.log("[CHAT] Switched to:", conversationId);
  }, [contacts]);

  const startDM = async (participantId) => {
    try {
      const res = await createConversation(participantId);
      const conv = res.data;

      // keepActive=true — existing active chat disturb mat karo
      const freshContacts = await loadConversations(true);

      // Nayi conversation switch karo
      const target = freshContacts.find((c) => sameId(c.id, conv.id));
      if (target) {
        activeDMIdRef.current = null; // force switch
        switchDM(conv.id);
      }
      return conv;
    } catch (err) {
      console.error("[CHAT] createConversation failed:", err.message);
      throw err;
    }
  };

  const retryMessage = useCallback(
    async (tempId, content) => {
      setDmMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "sending" } : m))
      );
      try {
        const clientMessageId = `cmid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const res = await apiSendMessage(activeDMId, { body: content, type: "text", clientMessageId });
        const saved = res.data;
        setDmMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, id: saved.id, timestamp: saved.createdAt, status: "sent" }
              : m
          )
        );
      } catch (err) {
        setDmMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
        );
        console.error("[MSG] Retry failed:", err.message);
      }
    },
    [activeDMId]
  );

  const getLastMessage = (conversationId) =>
    contacts.find((c) => sameId(c.id, conversationId))?.lastMessage || null;

  const getUnreadCount = (conversationId) =>
    contacts.find((c) => sameId(c.id, conversationId))?.unread || 0;

  const activeContact = contacts.find((c) => sameId(c.id, activeDMId)) || null;

  return (
    <ChatContext.Provider
      value={{
        contacts,
        activeDMId,
        activeContactId,
        activeContact,
        dmMessages,
        conversations,
        messagesLoading,
        conversationsLoading,
        sendMessage,
        retryMessage,
        switchDM,
        startDM,
        loadConversations,
        getLastMessage,
        getUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);