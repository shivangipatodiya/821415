import React from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { connect } from "react-redux";
import { changeReadStatus } from "../../store/utils/thunkCreators";
import Badge from "@material-ui/core/Badge";
import { unreadCount } from "../../helpers/chat";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab"
    }
  },
  badge: {
    marginRight: 25
  }
}));

const Chat = (props) => {
  const classes = useStyles();
  const { conversation, changeReadStatus } = props;
  const { otherUser } = conversation;

  const handleClick = async (conversation) => {
    await props.setActiveChat(conversation.otherUser.username);
    await changeReadStatus(conversation.id);
  };

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={conversation} />
      <Badge
        className={classes.badge}
        color="primary"
        badgeContent={unreadCount(conversation)}
      ></Badge>
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    },
    changeReadStatus: (conversationId) => {
      dispatch(changeReadStatus(conversationId));
    }
  };
};

export default connect(null, mapDispatchToProps)(Chat);
