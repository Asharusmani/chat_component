import api from "../index";

// ─────────────────────────────────────────────
// CONVERSATIONS
// ─────────────────────────────────────────────

/**
 * Get all conversations for logged-in user
 * GET /api/conversations
 */
export const getUserConversations = async (page = 1, limit = 20) => {
  const response = await api.get("/conversations", { params: { page, limit } });
  return response.data; // { success, data: [...conversations] }
};

/**
 * Get a specific conversation
 * GET /api/conversations/:conversationId
 */
export const getConversation = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
};

/**
 * Create a new DM conversation with another user
 * POST /api/conversations
 */
export const createConversation = async (participantId) => {
  const response = await api.post("/conversations", { participantId });
  return response.data; // { success, data: conversation }
};

/**
 * Delete a conversation
 * DELETE /api/conversations/:conversationId
 */
export const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/conversations/${conversationId}`);
  return response.data;
};

/**
 * Mark all messages in a conversation as read
 * PUT /api/conversations/:conversationId/read
 */
export const markConversationAsRead = async (conversationId) => {
  const response = await api.put(`/conversations/${conversationId}/read`);
  return response.data;
};

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

/**
 * Get paginated messages for a conversation
 * GET /api/conversations/:conversationId/messages
 * @param {string|number} conversationId
 * @param {object} params - { page, limit, before }
 */
export const getConversationMessages = async (conversationId, { page = 1, limit = 50, before } = {}) => {
  const response = await api.get(`/conversations/${conversationId}/messages`, {
    params: { page, limit, ...(before && { before }) },
  });
  return response.data; // { success, data: { messages, pagination } }
};

/**
 * Send a message in a conversation
 * POST /api/conversations/:conversationId/messages
 * @param {string|number} conversationId
 * @param {object} payload - { body, type, replyToId, clientMessageId }
 */
export const sendMessage = async (conversationId, { body, type = "text", replyToId, clientMessageId } = {}) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, {
    body,
    type,
    replyToId,
    clientMessageId,
  });
  return response.data; // { success, data: message }
};

/**
 * Edit a message
 * PUT /api/messages/:messageId
 */
export const editMessage = async (messageId, body) => {
  const response = await api.put(`/messages/${messageId}`, { body });
  return response.data;
};

/**
 * Delete a message
 * DELETE /api/messages/:messageId
 */
export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

/**
 * Mark a single message as read
 * PUT /api/messages/:messageId/read
 */
export const markMessageAsRead = async (messageId) => {
  const response = await api.put(`/messages/${messageId}/read`);
  return response.data;
};

// ─────────────────────────────────────────────
// REACTIONS
// ─────────────────────────────────────────────

/**
 * Add emoji reaction to a message
 * POST /api/messages/:messageId/reactions
 */
export const addReaction = async (messageId, emoji) => {
  const response = await api.post(`/messages/${messageId}/reactions`, { emoji });
  return response.data;
};

/**
 * Remove emoji reaction from a message
 * DELETE /api/messages/:messageId/reactions/:emoji
 */
export const removeReaction = async (messageId, emoji) => {
  const response = await api.delete(`/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
  return response.data;
};