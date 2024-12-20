import toast from "react-hot-toast";
import { account } from "./appwrite";
import { AppwriteException } from "appwrite";
import { MessageType } from "./Types";

export const login = async (Email: string, password: string) => {
  try {
    // Create the session with email and password
    const session = await account.createEmailPasswordSession(Email, password);

    return session; // You can return the session if needed for further handling
  } catch (error) {
    // Handle specific Appwrite error messages
    if (error instanceof AppwriteException) {
      console.error("Appwrite login error:", error.message);
      throw new Error(error.message); // Rethrow the error to be handled by the calling code
    } else {
      console.error("Unexpected login error:", error);
      throw new Error("An unexpected error occurred during login.");
    }
  }
};

export const logout = async () => {
  try {
    // Check if the user is logged in by attempting to fetch their account
    await account.get(); // If this succeeds, the user is logged in

    // If the user is logged in, delete their current session
    await account.deleteSession("current");
  } catch (error) {
    if (error instanceof AppwriteException) {
      if (error.code === 401) {
        toast.error("User is already logged out or not authenticated.");
      } else {
        toast.error("AppwriteException during logout:" + error.message);
        throw error;
      }
    } else {
      toast.error("Unexpected error during logout:" + error);
      throw error;
    }
  }
};

export const getAvatar = function (name: string) {
  return `https://cloud.appwrite.io/v1/avatars/initials?name=${
    name.split(" ").at(0) + "+" + name.split(" ").at(1)
  }&width=64&height=64&project=console&name=${
    name.split(" ").at(0) + "+" + name.split(" ").at(1)
  }&width=64&height=64&project=console`;
};

export const updateAvatarUrl = async (avatarUrl: string) => {
  try {
    const user = await account.updatePrefs({ avatarUrl });
    return user;
  } catch (error) {
    toast.error("Error updating avatar URL:" + error);
    throw error;
  }
};

export function parseMessages(inputMessages: string[]): MessageType[] {
  try {
    return inputMessages.map((messageString) => {
      const timestampRegex = /"timestamp":\s*"([^"]+)",/;
      const timestampMatch = messageString.match(timestampRegex);
      const timestamp = timestampMatch
        ? timestampMatch[1]
        : new Date().toISOString(); // Use current timestamp if none exists

      // Sanitize and format the input JSON string
      const sanitizedMessage = messageString.replace(timestampRegex, "");

      const messageWithoutTimestamp = sanitizedMessage
        .replace(/\n/g, "") // Remove newlines
        .replace(/(\w+):/g, '"$1":') // Add double quotes around keys
        .replace(/,\s*}/g, "}") // Remove trailing commas before closing braces
        .replace(/\\"/g, '"'); // Fix escaped quotes

      // Parse the sanitized message without the timestamp
      const parsedMessage: MessageType = JSON.parse(messageWithoutTimestamp);

      // If timestamp was found earlier, use it; otherwise, handle default case
      const finalTimestamp = timestamp || new Date().toISOString(); // Use current timestamp if none exists

      return {
        Message: parsedMessage.Message || "",
        timestamp: finalTimestamp, // Use the extracted timestamp or current timestamp
        senderId: parsedMessage.senderId || "",
        receiverId: parsedMessage.receiverId || "",
        status: parsedMessage.status || "pending",
      };
    });
  } catch (error) {
    console.error("Error parsing chat messages:", error);
    return [];
  }
}

export function parseMessage(inputMessage: string): MessageType | null {
  try {
    // Extract the timestamp from the string (if present)
    const timestampRegex = /"timestamp":\s*"([^"]+)",/;
    const timestampMatch = inputMessage.match(timestampRegex);
    const timestamp = timestampMatch
      ? timestampMatch[1]
      : new Date().toISOString(); // Use current timestamp if none exists

    // Sanitize and format the input JSON string
    const sanitizedMessage = inputMessage.replace(timestampRegex, "");

    const messageWithoutTimestamp = sanitizedMessage
      .replace(/\n/g, "") // Remove newlines
      .replace(/(\w+):/g, '"$1":') // Add double quotes around keys
      .replace(/,\s*}/g, "}") // Remove trailing commas before closing braces
      .replace(/\\"/g, '"'); // Fix escaped quotes

    // Parse the sanitized message without the timestamp
    const parsedMessage: MessageType = JSON.parse(messageWithoutTimestamp);

    // If timestamp was found earlier, use it; otherwise, handle default case
    const finalTimestamp = timestamp || new Date().toISOString(); // Use current timestamp if none exists

    return {
      Message: parsedMessage.Message || "",
      timestamp: finalTimestamp, // Use the extracted timestamp or current timestamp
      senderId: parsedMessage.senderId || "",
      receiverId: parsedMessage.receiverId || "",
      status: parsedMessage.status || "pending",
    };
  } catch (error) {
    console.error("Error parsing chat message:", error);
    return null; // Return null if parsing fails
  }
}
