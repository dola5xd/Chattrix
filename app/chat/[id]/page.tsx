"use client";
import Message from "@/app/_Components/Message";
import MessageField from "@/app/_Components/MessageField";
import { getAvatar, parseMessages } from "@/app/_lib/apiCalls";
import {
  fetchChatMessages,
  getAllMessagesByUserId,
  getUserData,
} from "@/app/_lib/appwrite";
import Image from "next/image";
import Link from "next/link";
import { BsThreeDots } from "react-icons/bs";
import { FaChevronLeft } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMessages } from "@/app/context/MessageContext";
import Spinner from "@/app/_Components/Spinner";
import { UserProfile } from "@/app/_lib/Types";

function Page() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const chatID = pathname.split("/").at(2) || "";
  const deliveredUserID = searchParams.get("to");
  const accID = searchParams.get("from");

  const [userData, setUserData] = useState<UserProfile | null>(null);
  const { setMessages, messages } = useMessages();
  const listRef = useRef<HTMLUListElement | null>(null);

  const fetchMessages = useCallback(async () => {
    if (accID) {
      const messages = await getAllMessagesByUserId(
        String(accID),
        String(deliveredUserID)
      );
      setMessages(parseMessages(messages));
    }
  }, [accID, deliveredUserID, setMessages]);

  const fetchUserData = useCallback(async () => {
    if (deliveredUserID) {
      const user = await getUserData(String(deliveredUserID));
      setUserData(user);
    }
  }, [deliveredUserID]);

  useEffect(() => {
    fetchMessages();
    fetchUserData();
  }, [fetchMessages, fetchUserData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchChatMessages(chatID, (newMessage) => {
        setMessages((prevMessages) => {
          if (
            prevMessages.some((msg) => msg.timestamp === newMessage.timestamp)
          ) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [chatID, setMessages]);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (!userData || !messages)
    return (
      <div className="h-full w-[80%] xl:w-[90%] flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <main className="py-7 px-4 w-[80%] xl:w-[100%] xl:px-20">
      <div className="flex items-center justify-between pb-4 bg-white">
        <button
          type="button"
          title="Return to chats!"
          className="text-2xl duration-500 hover:text-Purple"
        >
          <Link href={"/"}>
            <FaChevronLeft />
          </Link>
        </button>

        <div className="flex items-center gap-3">
          <span className="relative w-10 h-10 text-3xl rounded-full">
            {userData ? (
              <Image
                src={
                  userData?.avatarId
                    ? `https://cloud.appwrite.io/v1/storage/buckets/6755a0fc000528347454/files/${userData?.avatarId}/view?project=67559f2b0039b23d57d8&project=67559f2b0039b23d57d8`
                    : getAvatar(userData?.name)
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
          </span>{" "}
          <h2>{userData?.name}</h2>
        </div>
        <button
          type="button"
          title="More options"
          className="text-2xl duration-500 hover:text-Purple"
        >
          <BsThreeDots />
        </button>
      </div>
      <section
        className="chat-scroll overflow-y-scroll h-[calc(100%_-_120px)] flex flex-col relative py-10 gap-4 px-4"
        ref={listRef}
      >
        {messages?.length > 0 ? (
          messages?.map((message, i) => (
            <Message
              deliveredUserID={String(deliveredUserID)}
              message={message}
              key={i}
            />
          ))
        ) : (
          <p className="text-center text-gray-400">
            Start chatting with {userData?.name} now!
          </p>
        )}
      </section>
      <MessageField deliveredUserID={String(deliveredUserID)} />
    </main>
  );
}

export default Page;
