export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message]
    };
    newConvo.latestMessageText = message.text;
    let messagesReverse = [...newConvo.messages];
    const lastRead = messagesReverse
      .reverse()
      .find((msg) => msg.read && msg.senderId !== newConvo.otherUser.id);
    newConvo.lastMessageReadByOtherUser = message.read ? message : lastRead;
    newConvo.unreadMessagesCount = 1;
    return [newConvo, ...state];
  }

  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      const convoCopy = { ...convo };
      convoCopy.messages.push(message);
      convoCopy.latestMessageText = message.text;
      let messagesReverse = [...convoCopy.messages];
      const lastRead = messagesReverse
        .reverse()
        .find((msg) => msg.read && msg.senderId !== convoCopy.otherUser.id);

      convoCopy.lastMessageReadByOtherUser = message.read ? message : lastRead;
      convoCopy.unreadMessagesCount += 1;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const convoCopy = { ...convo };
      convoCopy.id = message.conversationId;
      convoCopy.messages.push(message);
      convoCopy.latestMessageText = message.text;
      convoCopy.lastMessageReadByOtherUser = message.read ? message : null;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const changeMessageStatus = (state, conversationId, userId) => {
  return state.map((convo) => {
    if (convo.id === conversationId) {
      const convoCopy = { ...convo };
      convoCopy.messages = convoCopy.messages.map((msg) => {
        if (msg.senderId !== userId) {
          return {
            ...msg,
            read: true
          };
        } else {
          return msg;
        }
      });
      const messagesReverse = [...convoCopy.messages];
      const lastRead = messagesReverse
        .reverse()
        .find((msg) => msg.read && msg.senderId !== convoCopy.otherUser.id);
      convoCopy.lastMessageReadByOtherUser = lastRead;
      convoCopy.unreadMessagesCount = 0;
      return convoCopy;
    } else {
      return convo;
    }
  });
};
