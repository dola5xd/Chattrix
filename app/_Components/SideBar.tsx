"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CiSettings } from "react-icons/ci";
import { GoHome } from "react-icons/go";
import { IoIosLogOut } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { MdGroups2 } from "react-icons/md";
import { TiMessages } from "react-icons/ti";
import { getAvatar, logout } from "../_lib/apiCalls";
import { User, useUser } from "../context/UserContext";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { RxAvatar } from "react-icons/rx";
import toast from "react-hot-toast";
import { AppwriteException } from "appwrite";
import { account } from "../_lib/appwrite";

function SideBar() {
  const { setLoggedInUser, loggedInUser } = useUser();
  const navigate = useRouter();
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);

  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Attempt to fetch the current session
        const session = await account.getSession("current");

        if (session || isLoggedOut) {
          // Fetch the logged-in user's account data
          const user = await account.get();

          setLoggedInUser(user as unknown as User);
        } else navigate.push("/login");
      } catch (error) {
        if (error instanceof AppwriteException && error.code === 401) {
          console.warn("No active session found. User is not logged in.");
          setLoggedInUser(null); // Ensure logged-in user state is cleared
          navigate.push("/login");
        } else {
          console.error("Error checking session:", error);
        }
      }
    };

    checkSession();
  }, [setLoggedInUser, navigate, isLoggedOut]);

  const handleLogout = async () => {
    try {
      await logout();
      setLoggedInUser(null);
      setIsLoggedOut(true);
      toast.success("Logout successful.");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error during logout:");
    }
  };

  return (
    <div className="h-full w-[20%] xl:w-[10%] flex flex-col gap-7 items-center py-7 shadow-lg">
      <span className="relative w-10 h-10 text-3xl rounded-full">
        {loggedInUser ? (
          <Image
            src={
              loggedInUser.prefs.avatarId
                ? `https://cloud.appwrite.io/v1/storage/buckets/6755a0fc000528347454/files/${loggedInUser.prefs.avatarId}/view?project=67559f2b0039b23d57d8&project=67559f2b0039b23d57d8`
                : getAvatar(loggedInUser.name)
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
      <div className="flex flex-col items-center justify-between h-full">
        <ul className="flex flex-col gap-4 *:text-2xl *:py-2 *:px-2 hover:*:bg-gray-300/40 *:rounded-md *:cursor-pointer *:duration-500">
          <li className={pathname === "/" ? "active-link" : ""}>
            <Link href={"/"}>
              <GoHome />
            </Link>
          </li>
          <li className={pathname === "/chats" ? "active-link" : ""}>
            <Link href={"/chats"}>
              <TiMessages />
            </Link>
          </li>
          <li className={pathname === "/groups" ? "active-link" : ""}>
            {" "}
            <Link href={"/groups"}>
              <MdGroups2 />{" "}
            </Link>
          </li>
          <li className={pathname === "/search" ? "active-link" : ""}>
            {" "}
            <Link href={"/search"}>
              <IoSearch />{" "}
            </Link>
          </li>
          <li className={pathname === "/settings" ? "active-link" : ""}>
            {" "}
            <Link href={"/settings"}>
              <CiSettings />{" "}
            </Link>
          </li>
        </ul>
        <button
          title="Logout!"
          type="button"
          className={"text-red-600 text-3xl"}
          onClick={handleLogout}
        >
          <IoIosLogOut />
        </button>
      </div>
    </div>
  );
}

export default SideBar;
