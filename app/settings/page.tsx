"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import {
  account,
  getUserIdFromSession,
  updateUserData,
} from "../_lib/appwrite";
import UploadComponent from "../_Components/UploadComponent";

function Page() {
  const { loggedInUser, setLoggedInUser } = useUser();
  const navigate = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<FileList | null>(null);
  const [userName, setUserName] = useState<string | undefined>(
    loggedInUser?.name
  );

  useEffect(() => {
    if (!loggedInUser) {
      navigate.push("/register");
    }
  }, [loggedInUser, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const previousAvatarId = loggedInUser?.prefs?.avatarId || null;
      const userId = await getUserIdFromSession();

      await updateUserData(userName!, avatarFile, previousAvatarId, userId);
      setLoggedInUser(await account.get());

      navigate.push("/");
    } catch (error) {
      console.error("Error updating user information:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-20 w-[80%] xl:w-[90%] px-7 flex flex-col gap-7">
      <h1 className="px-2 py-1 font-bold text-center text-white rounded-md bg-Purple">
        Let&apos;s Edit some informations about you!
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-2 px-10 [&>div>label]:text-gray-500 [&>div>input]:duration-500 [&>div>input]:px-2 [&>div>input]:py-2 [&>div>input]:bg-transparent [&>div>input]:rounded [&>div>input]:outline [&>div>input]:outline-2 [&>div>input]:outline-gray-500 focus:[&>div>input]:outline-Purple [&>div>input]:placeholder:text-sm [&>div>p]:text-red-600 [&>div>p]:text-sm disabled:[&>div>input]:bg-gray-500 disabled:[&>div>input]:bg-opacity-20 disabled:[&>div>input]:cursor-not-allowed [&>div>input]:"
      >
        <div>
          <label htmlFor="Username">Username:</label>
          <input
            type="text"
            id="Username"
            placeholder="Username"
            defaultValue={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="Email">Email:</label>
          <input
            type="email"
            id="Email"
            placeholder="Email"
            disabled
            value={loggedInUser?.email}
          />
        </div>
        <p className="text-gray-500">Avatar:</p>
        <UploadComponent
          avatarFile={avatarFile}
          setAvatarFile={setAvatarFile}
        />
        <button
          type="submit"
          className={`${
            loading ? "bg-opacity-30" : ""
          } py-3 text-white rounded-md bg-Purple duration-500 hover:bg-opacity-75`}
        >
          {loading ? "Submitting..." : "Submit Changes!"}
        </button>
      </form>
    </main>
  );
}

export default Page;
