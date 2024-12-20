import {
  Account,
  AppwriteException,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "appwrite";
import toast from "react-hot-toast";
import { UpdateUserPayload, UserProfile, MessageType } from "./Types";

const projectID: string = process.env.NEXT_PUBLIC_PROJECT_ID!;
const bucketAvatarID: string = process.env.NEXT_PUBLIC_BUCKET_AVATAR_ID!;
const databaseID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const userCollectionID = process.env.NEXT_PUBLIC_USER_COLLECTION_ID!;
const chatCollectionID = process.env.NEXT_PUBLIC_CHAT_COLLECTION_ID!;

const client = new Client();
const databases = new Databases(client);

client.setEndpoint("https://cloud.appwrite.io/v1").setProject(projectID);

export const account = new Account(client);
export const storage = new Storage(client);
export { ID };

export const registerUser = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    // Create user account
    const user = await account.create(ID.unique(), email, password, username);

    // Automatically create a session for the new user
    await account.createEmailPasswordSession(email, password);
    toast.success("Session created successfully.");

    // Store user in database with `user.$id` as the `documentId`
    const userDocument = await databases.createDocument(
      databaseID,
      userCollectionID,
      user.$id, // Use `user.$id` as the documentId
      {
        userID: user.$id,
        email: user.email,
        name: username,
        avatarId: null, // Optional default value
      }
    );

    return userDocument;
  } catch (error) {
    if (error instanceof AppwriteException) {
      if (error.code === 409) {
        toast.error("This user already has an account. Try logging in.");
      } else {
        toast.error(`AppwriteException: ${error.message}`);
      }
    } else {
      toast.error(`An unexpected error occurred: ${error}`);
    }
  }
};

export async function uploadAvatar(file: File, userId: string) {
  console.log("userId: ", userId);
  if (!file || !(file instanceof File)) {
    console.error("Invalid file:", file);
    toast.error("Invalid file. Please provide a valid file.");
  }

  try {
    // Upload the file to Appwrite storage
    const response = await storage.createFile(
      bucketAvatarID,
      ID.unique(),
      file
    );

    toast.success("File uploaded successfully");

    // Update the user's preferences
    const prefs = await account.getPrefs();
    await account.updatePrefs({ ...prefs, avatarId: response.$id });

    // Update the user's document in the database
    await databases.updateDocument(
      databaseID,
      userCollectionID,
      "675812cd00078f8b3f73", // The document ID is the user's ID
      { avatarId: response.$id }
    );
  } catch (error) {
    if (error instanceof Error) {
      toast.error("Error uploading avatar:" + error.message);
    } else {
      toast.error("Unexpected error:" + error);
    }
  }
}

export async function updateUserData(
  name: string,
  avatar: FileList | null,
  previousAvatarId: string | null,
  userId: string // This must match the documentId
) {
  try {
    // Update user name in Appwrite
    await account.updateName(name);

    let newAvatarId = null;

    // Handle avatar updates
    if (avatar && avatar.length > 0) {
      const file = avatar[0];

      // Delete the previous avatar if it exists
      if (previousAvatarId) {
        try {
          await storage.deleteFile(bucketAvatarID, previousAvatarId);
          console.log("Previous avatar deleted successfully.");
        } catch (error) {
          console.error("Error deleting previous avatar:", error);
        }
      }

      // Upload the new avatar
      const response = await storage.createFile(
        bucketAvatarID,
        ID.unique(),
        file
      );
      newAvatarId = response.$id;

      // Update user's preferences
      const prefs = await account.getPrefs();
      await account.updatePrefs({ ...prefs, avatarId: newAvatarId });
    }

    // Prepare the update payload
    const updatePayload: UpdateUserPayload = { name };
    if (newAvatarId) updatePayload.avatarId = newAvatarId;

    // Update the user's document in the database
    await databases.updateDocument(
      databaseID,
      userCollectionID,
      userId,
      updatePayload
    );

    toast.success("User data updated successfully in Appwrite and database.");
  } catch (error) {
    toast.error("Error updating user data:" + error);
    if (error instanceof AppwriteException) {
      toast.error("AppwriteException:" + error.message);
    }
  }
}

export async function storeUserProfile(userID: string, avatarId: string) {
  try {
    await databases.createDocument(databaseID, userCollectionID, ID.unique(), {
      userID,
      avatarId,
    });
    console.log("User profile stored successfully");
  } catch (error) {
    console.error("Error storing user profile:", error);
  }
}

export async function getUserData(userID: string) {
  if (!userID) {
    console.error("Invalid userID:", userID);
    throw new Error("Invalid userID provided.");
  }

  try {
    const response = await databases.listDocuments(
      databaseID,
      userCollectionID,
      [Query.equal("userID", userID)]
    );

    if (response.documents.length > 0) {
      const userProfile = response.documents[0];
      return userProfile as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    throw error; // Re-throw the error for higher-level handling
  }
}

export const getUserIdFromSession = async (): Promise<string> => {
  try {
    const session = await account.get();
    return session.$id; // This is the user's ID
  } catch (error) {
    console.error("Error retrieving user session:", error);
    throw error;
  }
};

export async function getAllMessagesByUserId(
  loggedInUserId: string,
  targetUserId: string
) {
  try {
    const isSelfChat = loggedInUserId === targetUserId;

    const query = [
      Query.and([
        Query.equal("senderID", loggedInUserId),
        Query.equal("receiverID", targetUserId),
      ]),

      Query.and([
        Query.equal("senderID", targetUserId),
        Query.equal("receiverID", loggedInUserId),
      ]),
    ];

    if (!isSelfChat) {
      query.push(Query.notEqual("senderID", "receiverID"));
    }
    const response = await databases.listDocuments(
      databaseID,
      chatCollectionID,
      query
    );

    // Initialize an array to hold all messages
    let allMessages: string[] = [];

    // Loop through the documents and collect messages from each document

    response.documents.forEach((doc) => {
      if (doc.messages && Array.isArray(doc.messages)) {
        allMessages = [...allMessages, ...doc.messages];
      }
    });

    // If there are messages, return the array of all messages
    if (allMessages.length > 0) {
      return allMessages;
    } else {
      console.log("No messages found for this user.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export const submitMessage = async (
  chatID: string,
  newMessageData: MessageType
) => {
  try {
    // Attempt to get the existing document using the chatID
    const existingDocument = await databases.getDocument(
      databaseID, // The database ID
      chatCollectionID, // The collection ID
      chatID // The document ID (chatID)
    );

    // If the document exists, update it with the new message
    const updatedMessage = {
      messages: [
        ...existingDocument.messages,
        JSON.stringify({
          Message: newMessageData.Message,
          timestamp: newMessageData.timestamp,
          senderId: newMessageData.senderId,
          receiverId: newMessageData.receiverId,
          status: newMessageData.status,
        }),
      ],
      senderID: newMessageData.senderId,
      receiverID: newMessageData.receiverId,
    };

    await databases.updateDocument(
      databaseID, // The database ID
      chatCollectionID, // The collection ID
      chatID, // The document ID (chatID)
      updatedMessage // The new message data to update
    );

    console.log("Message updated successfully");
  } catch (error) {
    // If no document exists, create a new one
    if (error instanceof AppwriteException && error.code === 404) {
      const newMessageDocument = {
        messages: [
          JSON.stringify({
            Message: newMessageData.Message,
            timestamp: newMessageData.timestamp,
            senderId: newMessageData.senderId,
            receiverId: newMessageData.receiverId,
            status: newMessageData.status,
          }),
        ],
        senderID: newMessageData.senderId,
        receiverID: newMessageData.receiverId,
        chatID: chatID, // Ensure you have chatID for the new document
      };

      await databases.createDocument(
        databaseID, // The database ID
        chatCollectionID, // The collection ID
        chatID, // Use the same chatID as the document ID
        newMessageDocument // The new message data to create
      );

      console.log(
        "Message document created and message submitted successfully"
      );
    } else {
      // If it's any other error, log it
      console.error("Error submitting message:", error);
      throw new Error("Failed to submit message");
    }
  }
};

export const getChatOverviewByUserID = async (userID: string) => {
  try {
    const response = await databases.listDocuments(
      databaseID,
      chatCollectionID,
      [
        Query.or([
          Query.equal("senderID", userID),
          Query.equal("receiverID", userID),
        ]),
      ]
    );

    if (response.documents.length > 0) {
      const chatOverviews = response.documents.map((chat) => {
        const otherUserID =
          chat.senderID === userID ? chat.receiverID : chat.senderID;

        const lastMessage = chat.messages?.[chat.messages.length - 1] || {
          text: "No messages yet",
          timestamp: 0,
        };
        const timestampRegex = /"timestamp":\s*"([^"]+)",/;
        const timestampMatch = lastMessage.match(timestampRegex);
        const timestamp = timestampMatch
          ? new Date(timestampMatch[1]).getTime()
          : new Date().getTime();

        return {
          chatID: chat.chatID,
          otherUserID: otherUserID,
          lastMessage: lastMessage,
          timestamp,
        };
      });
      chatOverviews.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      return chatOverviews;
    } else {
      console.log("No chats found for the user");
      return [];
    }
  } catch (error) {
    console.error("Error retrieving chat overview:", error);
    throw new Error("Failed to retrieve chat overview");
  }
};

export const fetchChatMessages = async (
  chatID: string,
  callback: (message: MessageType) => void
) => {
  try {
    const chatDocument = await databases.getDocument(
      databaseID,
      chatCollectionID,
      chatID
    );

    if (chatDocument.messages && chatDocument.messages.length > 0) {
      const newMessage =
        chatDocument.messages[chatDocument.messages.length - 1];

      const parsedMessage: MessageType = JSON.parse(newMessage);

      callback(parsedMessage);
    } else {
      console.warn("No messages found in the chat.");
    }
  } catch (error) {
    console.error("Error fetching chat messages:", error);
  }
};

export const searchUserByName = async (name: string) => {
  console.log("Searching for name:", name);
  try {
    // Use Query.equal to search for an exact match
    const response = await databases.listDocuments(
      databaseID,
      userCollectionID,
      [Query.search("name", name)] // Exact match for the name field
    );

    // Check if we got any documents
    if (response && response.documents && response.documents.length > 0) {
      return response.documents as UserProfile[]; // Return the user document
    } else {
      console.warn("No user found with that name.");
      return []; // Return null if no user is found
    }
  } catch (error) {
    console.error("Error fetching user by name:", error);
    return []; // Return null in case of error
  }
};

export const searchUserByEmail = async (email: string) => {
  console.log("Searching for email:", email);
  try {
    // Use Query.equal to search for an exact match
    const response = await databases.listDocuments(
      databaseID,
      userCollectionID,
      [Query.search("email", email)] // Exact match for the email field
    );

    // Check if we got any documents
    if (response && response.documents && response.documents.length > 0) {
      console.log("response.documents[0]: ", response.documents[0]);
      return [response.documents[0]] as UserProfile[]; // Return the user document
    } else {
      console.warn("No user found with that email.");
      return []; // Return null if no user is found
    }
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return []; // Return null in case of error
  }
};

export const checkExistingChat = async (
  loggedInUserId: string,
  targetUserId: string
) => {
  try {
    const query = [
      Query.or([
        Query.and([
          Query.equal("senderID", loggedInUserId),
          Query.equal("receiverID", targetUserId),
        ]),

        Query.and([
          Query.equal("senderID", targetUserId),
          Query.equal("receiverID", loggedInUserId),
        ]),
      ]),
    ];

    const response = await databases.listDocuments(
      databaseID,
      chatCollectionID,
      query
    );

    if (response.documents.length === 0) {
      // No existing chat, create a new one
      const newChatData = {
        chatID: ID.unique(),
        senderID: loggedInUserId,
        receiverID: targetUserId,
      };

      const newChat = await databases.createDocument(
        databaseID,
        chatCollectionID,
        newChatData.chatID,
        newChatData
      );

      return newChat.$id;
    }

    // If a chat is found, return the first existing chat's ID
    console.log("Existing chat found:", response.documents[0].$id);
    return response.documents[0].$id;
  } catch (error) {
    console.error("Error checking for existing chat:", error);
    return null;
  }
};
