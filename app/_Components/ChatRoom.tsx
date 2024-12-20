import Link from "next/link";
import { getUserData } from "../_lib/appwrite";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getAvatar, parseMessage } from "../_lib/apiCalls";
import { RxAvatar } from "react-icons/rx";
import { useUser } from "../context/UserContext";
import { chatsforUser, Message, UserProfile } from "../_lib/Types";

function ChatRoom({ chat }: { chat: chatsforUser; key: string }) {
  const { chatID, lastMessage, otherUserID } = chat;

  const message: Message | null =
    lastMessage === "No messages yet"
      ? null
      : (parseMessage(lastMessage) as Message); // Ensure the parsed message is cast as Message

  const { loggedInUser } = useUser();

  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchOtherUserAvatarId = async () => {
      const userData = await getUserData(otherUserID);
      setOtherUser(userData);
    };
    fetchOtherUserAvatarId();
  }, [otherUserID]);

  return (
    <Link
      href={`/chat/${chatID}?from=${loggedInUser?.$id}&to=${otherUserID}`}
      className="flex items-center px-4 py-2 xl:py-4 rounded-lg cursor-pointer gap-7 bg-gray-200/40"
    >
      <span className="relative w-10 h-10 text-3xl rounded-full">
        {otherUser ? (
          <Image
            src={
              otherUser?.avatarId
                ? `https://cloud.appwrite.io/v1/storage/buckets/6755a0fc000528347454/files/${otherUser?.avatarId}/view?project=67559f2b0039b23d57d8&project=67559f2b0039b23d57d8`
                : getAvatar(otherUser?.name)
            }
            width={40}
            height={40}
            quality={50}
            alt="Profile avatar"
            className="rounded-full object-cover w-[40px] h-[40px]"
          />
        ) : (
          <RxAvatar />
        )}
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-bold">{otherUser?.name}</h2>
        <p className="text-sm text-gray-400">
          {message ? (
            <>
              {message.receiverId === otherUserID ? "You" : otherUser?.name}:{" "}
              {message.Message || "Start chatting now!"} .
              <span>
                {message.timestamp
                  ? new Date(message.timestamp).toLocaleDateString()
                  : ""}
              </span>
            </>
          ) : (
            <span className="font-bold">Start chatting now!</span>
          )}
        </p>
      </div>
    </Link>
  );
}

export default ChatRoom;
