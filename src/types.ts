export type PresenceStatus = "online" | "idle" | "dnd" | "offline";

export type MessageKind = "text" | "image" | "file";

export type ChannelKind = "text" | "voice";

export type ConversationKind = "direct" | "group";

export type FriendStatus = "pending" | "accepted" | "declined";

export interface User {
  id: string;
  fullName: string;
  email: string;
  status: PresenceStatus;
}

export interface Server {
  id: string;
  name: string;
  color: string;
  ownerId: string;
  memberIds: string[];
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: ChannelKind;
  description?: string;
  participantCount: number;
  maxParticipants: number;
}

export interface Conversation {
  id: string;
  name: string;
  type: ConversationKind;
  participantIds: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: string | null;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  type: MessageKind;
  fileUrl: string;
  channelId?: string;
  conversationId?: string;
  createdAt: string;
}

export interface Friend {
  id: string;
  requesterId: string;
  requesterName: string;
  targetId: string;
  targetName: string;
  status: FriendStatus;
}

export interface ChatTarget {
  kind: "channel" | "conversation";
  id: string;
}

export interface AppState {
  users: User[];
  servers: Server[];
  channels: Channel[];
  conversations: Conversation[];
  messages: Message[];
  friends: Friend[];
}
