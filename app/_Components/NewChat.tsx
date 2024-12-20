import { useState } from "react";
import { UserProfile } from "../_lib/Types";

import Image from "next/image";
import { RxAvatar } from "react-icons/rx";
import { getAvatar } from "../_lib/apiCalls";
import { useUser } from "../context/UserContext";
import Spinner from "./Spinner";
import {
  checkExistingChat,
  searchUserByEmail,
  searchUserByName,
} from "../_lib/appwrite";
import { useRouter } from "next/navigation";

function NewChat() {
  const [searchBy, setSearchBy] = useState<"email" | "name">("email");
  const [searching, setSearching] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [users, setUsers] = useState<UserProfile[] | []>([]);
  const { loggedInUser } = useUser();
  const router = useRouter();

  const handleSearch = async () => {
    setSearching(true);
    let data;
    if (searchBy === "email") {
      data = await searchUserByEmail(searchValue);
    } else {
      data = await searchUserByName(searchValue);
    }
    setUsers(data);
    setSearching(false);
  };

  const handleChatClick = async (userId: string) => {
    const ChatId = await checkExistingChat(String(loggedInUser?.$id), userId);

    router.push(`/chat/${ChatId}?from=${loggedInUser?.$id}&to=${userId}`);
  };

  return (
    <div className="rounded-md ring-2 ring-black text-black bg-white z-30 w-3/4 h-3/4 px-7 py-7 flex flex-col items-center gap-4">
      <h1 className="text-xl font-bold">Create new Chat:</h1>
      <div className="flex items-center bg-white rounded-xl ring-1 ring-black text-base gap-0 *:px-4 *:py-2 *:h-full z-10 *:duration-500">
        <button
          type="button"
          title="email search"
          onClick={() => setSearchBy("email")}
          className={
            searchBy === "email" ? "bg-Purple rounded-l-xl text-white" : ""
          }
        >
          Email
        </button>
        <button
          type="button"
          title="name search"
          onClick={() => setSearchBy("name")}
          className={
            searchBy === "name" ? "bg-Purple rounded-r-xl text-white" : ""
          }
        >
          Username
        </button>
      </div>

      <input
        type="text"
        placeholder={`Search by ${searchBy}`}
        className="py-2 px-4 rounded-lg ring-2 ring-black outline-none focus:outline-none focus:ring-Purple duration-500"
        onChange={(e) => setSearchValue(e.target.value)}
        value={searchValue}
      />
      <button
        title="search"
        type="button"
        className={`bg-Purple py-2 px-4 rounded-lg text-white hover:bg-opacity-75 duration-500 ${
          searching ? "bg-opacity-75" : ""
        }`}
        onClick={handleSearch}
      >
        {searching ? "Searching..." : "Search"}
      </button>
      {searching ? (
        <div>
          <Spinner />
        </div>
      ) : (
        <div className="w-full">
          {users.length > 0 && (
            <ul className="w-full flex flex-col gap-4">
              {users?.map((user) => (
                <li key={user.$id} className="w-full">
                  <button
                    onClick={() => handleChatClick(user.$id)} // Handle click to check for existing chat
                    className="flex items-center px-7 py-2 rounded-lg cursor-pointer justify-center gap-7 bg-gray-200/40 w-full"
                  >
                    <span className="relative w-10 h-10 text-3xl rounded-full">
                      {user ? (
                        <Image
                          src={
                            user?.avatarId
                              ? `https://cloud.appwrite.io/v1/storage/buckets/6755a0fc000528347454/files/${user?.avatarId}/view?project=67559f2b0039b23d57d8&project=67559f2b0039b23d57d8`
                              : getAvatar(user?.name)
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
                      <h2 className="font-bold">{user?.name}</h2>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NewChat;
