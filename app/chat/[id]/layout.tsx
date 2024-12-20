import { MessageProvider } from "@/app/context/MessageContext";
import { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return <MessageProvider>{children}</MessageProvider>;
}

export default Layout;
