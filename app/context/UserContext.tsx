"use client";
import { createContext, ReactNode, useContext, useState } from "react";

export type User = {
  $createdAt: string;
  $id: string;
  $updatedAt: string;
  accessedAt: string;
  email: string;
  emailVerification: boolean;
  labels: string[];
  mfa: boolean;
  name: string;
  passwordUpdate: string;
  phone: string;
  phoneVerification: boolean;
  prefs: {
    avatarUrl: string;
    avatarId: string;
    [key: string]: unknown; // Allows for additional preferences
  };
  registration: string;
  status: boolean;
};

const UserContext = createContext<{
  setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>;
  loggedInUser: User | null;
} | null>(null);

function UserProvider({ children }: { children: ReactNode }) {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ setLoggedInUser, loggedInUser }}>
      {children}
    </UserContext.Provider>
  );
}

const useUser = function () {
  const context = useContext(UserContext);
  if (!context) throw new Error("Context is outside provider!");
  return context;
};

export { useUser, UserProvider };
