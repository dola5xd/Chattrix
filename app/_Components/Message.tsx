"use client";
import { getUserData } from "../_lib/appwrite";
import Image from "next/image";
import { getAvatar } from "../_lib/apiCalls";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { MessageType, UserProfile } from "../_lib/Types";

function Message({
  deliveredUserID,
  message,
}: {
  deliveredUserID: string;
  message: MessageType;
}) {
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const { Message, timestamp, senderId } = message;

  const type = senderId === deliveredUserID ? "received" : "send";

  const { loggedInUser } = useUser();

  useEffect(() => {
    const fetchOtherUserAvatarId = async () => {
      const userData = await getUserData(String(senderId));
      setOtherUser(userData);
    };
    fetchOtherUserAvatarId();
  }, [senderId]);

  return (
    <div
      className={`${type} flex items-start [&>div]:flex [&>div]:items-center [&>div]:flex-col [&>div]:gap-2`}
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
          <Image
            src={
              loggedInUser?.prefs
                ? `https://cloud.appwrite.io/v1/storage/buckets/6755a0fc000528347454/files/${loggedInUser?.prefs?.avatarId}/view?project=67559f2b0039b23d57d8&project=67559f2b0039b23d57d8`
                : getAvatar(String(loggedInUser?.name))
            }
            width={40}
            height={40}
            quality={50}
            alt="Profile avatar"
            className="rounded-full object-cover w-[40px] h-[40px]"
          />
        )}
      </span>
      <div>
        <p>{Message}</p>
        <span>
          {new Date(String(timestamp)).toLocaleString("en-GB", {
            timeZone: "UTC",
          })}
        </span>
      </div>
    </div>
  );
}

export default Message;
