import axios from "axios";
import socket from "../../socket";
import store from "../";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  updateMessage
} from "../conversations";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    dispatch(gotConversations(data));
  } catch (error) {
    console.error(error);
  }
};

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender
  });
};

const updateMessageReadByReceiver = (conversationId, userId) => {
  socket.emit("message-read-by-receiver", { conversationId, userId });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
    const data = await saveMessage(body);

    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
    } else {
      dispatch(setNewMessage(data.message));
    }

    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};

export const changeReadStatus =
  (conversationId, userId) => async (dispatch) => {
    try {
      if (!conversationId) {
        return;
      }
      await axios.put(`/api/messages`, { conversationId });

      dispatch(updateMessage(conversationId, userId));
      updateMessageReadByReceiver(conversationId, userId);
    } catch (error) {
      console.error(error);
    }
  };
export const processNewMessage = (data) => (dispatch) => {
  const state = store.getState();
  const convo = state.conversations.find(
    (convo) => convo.otherUser.username === state.activeConversation
  );
  if (convo && convo.otherUser.id === data.message.senderId) {
    dispatch(changeReadStatus(data.message.conversationId));
  }
  dispatch(setNewMessage(data.message, data.sender));
};

export const processMessageReadByReceiver = (data) => (dispatch) => {
  const state = store.getState();
  const convo = state.conversations.find(
    (aConvo) => aConvo.otherUser.username === state.activeConversation
  );
  if (convo && convo.id === data.conversationId) {
    dispatch(updateMessage(data.conversationId, data.userId, true));
  }
};
