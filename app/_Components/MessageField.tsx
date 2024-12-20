"use client";
import { useState } from "react";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { submitMessage } from "../_lib/appwrite";
import { useUser } from "../context/UserContext";
import { useMessages } from "../context/MessageContext";
import { usePathname } from "next/navigation";
import { MessageType } from "../_lib/Types";
import { BsEmojiSmile } from "react-icons/bs";
import toast from "react-hot-toast";

function MessageField({ deliveredUserID }: { deliveredUserID: string }) {
  const pathname = usePathname();

  const chatID = pathname.split("/").at(2) || "";

  const [message, setMessage] = useState<string>("");
  const [openEmoji, setOpenEmoji] = useState<boolean>(false);
  const { loggedInUser } = useUser();
  const { setMessages } = useMessages();

  const handleSent = async function () {
    if (message.length <= 0) {
      toast.error("Write message cant sent it blank!", {
        position: "top-right",
      });
      return;
    }
    const newMessage: MessageType = {
      Message: message,
      timestamp: new Date().toISOString(),
      senderId: loggedInUser?.$id,
      receiverId: deliveredUserID,
      status: "pending",
    };

    await submitMessage(chatID, newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  return (
    <div className="fixed bottom-4 py-4 rounded-md flex items-center  px-4 xl:pl-20 w-[80%] gap-7 justify-center">
      <div className="flex items-center w-3/4 gap-7">
        <input
          placeholder="Aa"
          className="w-full px-2 py-2 bg-transparent bg-gray-200 rounded resize-none no-scroll outline outline-2 outline-Purple text-wrap"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="button"
          title="emoji"
          onClick={() => setOpenEmoji((prev) => !prev)}
        >
          <BsEmojiSmile />
        </button>{" "}
      </div>

      <div className=" absolute -top-[500%] xl:right-20 xl:-top-[600%] ">
        <EmojiPicker
          open={openEmoji}
          searchDisabled
          skinTonesDisabled
          onEmojiClick={(emoji) => {
            setMessage((prev) => prev + emoji.emoji);
            setOpenEmoji(false);
          }}
        />
      </div>
      <button
        type="button"
        title="Send"
        className="text-xl duration-500 text-Purple hover:text-black"
        onClick={handleSent}
      >
        <IoSend />
      </button>
    </div>
  );
}

export default MessageField;
