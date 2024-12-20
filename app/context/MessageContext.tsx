"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { MessageType } from "../_lib/appwrite";

const MessageContext = createContext<{
  setMessages: React.Dispatch<React.SetStateAction<MessageType[] | []>>;
  messages: MessageType[] | [];
} | null>(null);

function MessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<MessageType[] | []>([]);

  return (
    <MessageContext.Provider value={{ setMessages, messages }}>
      {children}
    </MessageContext.Provider>
  );
}

const useMessages = function () {
  const context = useContext(MessageContext);
  if (!context) throw new Error("Context is outside provider!");
  return context;
};

export { useMessages, MessageProvider };
