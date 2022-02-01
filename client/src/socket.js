import io from "socket.io-client";
import store from "./store";
import { removeOfflineUser, addOnlineUser } from "./store/conversations";
import {
  processNewMessage,
  processMessageReadByReceiver
} from "./store/utils/thunkCreators";

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
    store.dispatch(processNewMessage(data));
  });
  socket.on("message-read-by-receiver", (data) => {
    store.dispatch(processMessageReadByReceiver(data));
  });
});

export default socket;
