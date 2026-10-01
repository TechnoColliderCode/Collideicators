export type PresenceStatus = "online" | "idle" | "dnd" | "offline";

export type MessageKind = "text" | "image" | "file";

export type ChannelKind = "text" | "voice";

export type ConversationKind = "direct" | "group";

export type FriendStatus = "pending" | "accepted" | "declined";

export type MessageStatus = "sent" | "delivered" | "read";

export interface User {
  id: string;
  fullName: string;
  email: string;
  status: PresenceStatus;
  passwordHash?: string;
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

export interface ReplyRef {
  messageId: string;
  senderName: string;
  content: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
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
  replyTo?: ReplyRef | null;
  reactions: Reaction[];
  pinned: boolean;
  editedAt?: string | null;
  unsent?: boolean;
  mentions?: string[];
}

export interface Friend {
  id: string;
  requesterId: string;
  requesterName: string;
  targetId: string;
  targetName: string;
  status: FriendStatus;
}

export interface VoiceSession {
  channelId: string | null;
  participantIds: string[];
  muted: boolean;
  deafened: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  startsAt: string;
  hostId: string;
  participantIds: string[];
}

export interface ChatTarget {
  kind: "channel" | "conversation";
  id: string;
}

export interface AppState {
  currentUserId: string | null;
  users: User[];
  servers: Server[];
  channels: Channel[];
  conversations: Conversation[];
  messages: Message[];
  friends: Friend[];
  lastRead: Record<string, string>;
  voice: VoiceSession;
  meetings: Meeting[];
  typing: Record<string, string>;
}
