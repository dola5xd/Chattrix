"use client";
import { useEffect, useState } from "react";
import { HiMiniPencilSquare } from "react-icons/hi2";
import ChatRoom from "./_Components/ChatRoom";
import { useUser } from "./context/UserContext";
import { account, getChatOverviewByUserID } from "./_lib/appwrite";
import { chatsforUser } from "./_lib/Types";
import NewChat from "./_Components/NewChat";
import { CgClose } from "react-icons/cg";
import { useRouter } from "next/navigation";
import Spinner from "./_Components/Spinner";

function Page() {
  const navigate = useRouter();
  const { loggedInUser, setLoggedInUser } = useUser();
  const [chats, setChats] = useState<chatsforUser[] | []>([]);
  const [openNewChat, setNewChat] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (loggedInUser?.$id) {
        const chatsforUser = await getChatOverviewByUserID(
          String(loggedInUser?.$id)
        );
        setChats(chatsforUser);
      }
    };
    fetchUserData();
  }, [loggedInUser?.$id]);

  const openNewMessage = function () {
    setNewChat(true);
  };

  // Check if the user is already logged in and redirect them to the homepage
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.getSession("current");
        console.log("session: ", session);
        if (session) {
          setLoggedInUser(await account.get()); // Set the logged-in user context
          navigate.push("/"); // Redirect to the home page if logged in
        }
      } catch (error) {
        if (error instanceof Error) {
          if (
            !error.message.includes(
              "User (role: guests) missing scope (account)"
            )
          ) {
            console.error(error.message);
          }
        }
      }
    };
    checkSession();
  }, [setLoggedInUser, navigate]);

  useEffect(() => {
    if (!loggedInUser) {
      navigate.push("/login");
    }
  }, [loggedInUser, navigate]);

  if (!loggedInUser)
    return (
      <div className="bg-white z-50 fixed top-0 left-0 h-full flex items-center justify-center w-screen">
        <Spinner />
      </div>
    );

  return (
    <>
      <main className="py-7 w-[80%] xl:w-[90%] px-7 xl:px-10">
        <div className="flex items-center justify-between w-full">
          <h1 className="px-4 py-2 text-xl xl:text-2xl font-bold text-white rounded-md bg-Purple">
            Chats{" "}
          </h1>
          <button
            type="button"
            title="add new chat!"
            className="px-2 py-2 text-3xl hover:text-Purple duration-500"
            onClick={openNewMessage}
          >
            <HiMiniPencilSquare />
          </button>
        </div>

        <section className="flex flex-col gap-7 py-7 xl:px-10">
          {chats.map((chat) => (
            <ChatRoom chat={chat} key={chat.chatID} />
          ))}
        </section>
      </main>
      {openNewChat && (
        <section className="absolute w-full h-full flex flex-col justify-center items-center bg-black bg-opacity-25">
          <span
            className="bg-white h-10 w-10 p-2 text-xl flex items-center justify-center rounded-full ring-2 absolute right-10 top-10 text-black cursor-pointer hover:text-Purple font-bold duration-500"
            onClick={() => setNewChat(false)}
          >
            <CgClose />
          </span>
          <NewChat />
        </section>
      )}
    </>
  );
}

export default Page;
