export interface UpdateUserPayload {
  name: string;
  avatarId?: string | null; // Avatar URL is optional, it could be null if no avatar is uploaded
}

export interface chatsforUser {
  chatID: string;
  otherUserID: string;
  lastMessage: string;
}

export interface Message {
  receiverId: string;
  Message: string;
  timestamp: string;
}

export interface MessageType {
  Message: string; // Message content is a string
  timestamp?: string; // Optional timestamp for when the message was sent/received
  senderId?: string; // Optional sender ID (could be user ID)
  receiverId?: string; // Optional receiver ID (could be user ID)
  status?: "pending" | "delivered" | "read"; // Optional status of the message
}

export interface UserProfile {
  $collectionId: string;
  $createdAt: string; // ISO date string
  $databaseId: string;
  $id: string; // Document ID
  $permissions: string[]; // Array of permissions as strings
  $updatedAt: string; // ISO date string
  avatarId: string; // ID of the avatar file
  email: string; // User's email address
  name: string; // User's full name
  userID: string; // User's unique identifier
  Massages: MessageType[]; // User's unique identifier
}
