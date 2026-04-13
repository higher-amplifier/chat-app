import React, { useEffect, useRef, useState, useContext } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef(null);
  const [input, setInput] = useState("");

  const handleSendMessage = async e => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = async e => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser]);

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />

        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7"
        />

        <img
          src={assets.help_icon}
          alt=""
          className="max-md:hidden max-w-5"
        />
      </div>

      {/* MESSAGES */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => {
          const isMyMessage = msg.senderId === authUser._id;

          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              {/* MESSAGE BOX */}
              <div className="flex flex-col gap-1 mb-8 max-w-[220px]">

                {/* 👉 SENDER: image first */}
                {isMyMessage && msg.image && (
                  <img
                    src={msg.image}
                    alt=""
                    className="rounded-lg border border-gray-700"
                  />
                )}

                {/* TEXT */}
                {msg.text && (
                  <p
                    className={`p-2 text-sm font-light rounded-lg break-all ${
                      isMyMessage
                        ? "bg-violet-500/30 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}

                {/* 👉 RECEIVER: image after text */}
                {!isMyMessage && msg.image && (
                  <img
                    src={msg.image}
                    alt=""
                    className="rounded-lg border border-gray-700"
                  />
                )}
              </div>

              {/* PROFILE + TIME */}
              <div className="text-center text-xs">
                <img
                  src={
                    isMyMessage
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  alt=""
                  className="w-7 rounded-full"
                />
                <p className="text-gray-500">
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={scrollEnd}></div>
      </div>

      {/* INPUT */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendMessage(e)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 outline-none text-white bg-transparent placeholder-gray-400"
          />

          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />

          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>

        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10">
      <img src={assets.logo_icon} className="max-w-60" alt="" />
      <p className="text-xl font-medium text-white">
        Chat anytime, anywhere
      </p>
    </div>
  );
};

export default ChatContainer;