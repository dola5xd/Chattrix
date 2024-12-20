import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SideBar from "./_Components/SideBar";
import { UserProvider } from "./context/UserContext";
import { Toaster } from "react-hot-toast";

const poppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["100", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Chattrix | Connect and Message Your Friends",
  description:
    "Chattrix is a modern and user-friendly messaging platform designed to help you stay connected with friends and loved ones. Join the conversation today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppinsFont.className} antialiased h-screen flex`}>
        <UserProvider>
          <SideBar />
          {children}
          <Toaster position="bottom-right" />
        </UserProvider>
      </body>
    </html>
  );
}
