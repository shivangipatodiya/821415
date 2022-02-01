import React from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

const Messages = (props) => {
  const { messages, otherUser, userId } = props;
  const messageByOtherUser = messages.filter((msg) => {
    return msg.senderId === userId && msg.read;
  });
  const lastMessageByOtherUser =
    messageByOtherUser[messageByOtherUser.length - 1];
  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
          <SenderBubble
            key={message.id}
            lastMessageByOtherUser={lastMessageByOtherUser}
            id={message.id}
            read={message.read}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        ) : (
          <OtherUserBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
