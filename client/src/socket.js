import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser
} from "./store/conversations";
import { changeReadStatus } from "./store/utils/thunkCreators";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });
  socket.on("new-message", (data) => {
    const state = store.getState();
    const convo = state.conversations.find(
      (convo) => convo.otherUser.username === state.activeConversation
    );
    if (convo && convo.otherUser.id === data.message.senderId) {
      store.dispatch(changeReadStatus(convo.id));
    }

    store.dispatch(
      setNewMessage(data.message, data.sender, state.activeConversation)
    );
  });
});

export default socket;
