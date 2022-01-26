export const unreadCount = (conversation) => {
  let unread = conversation.messages.filter(
    (msg) => msg.senderId === conversation.otherUser.id && msg.read === false
  );
  return unread.length;
};
