import type {
  AppState,
  Channel,
  ChatTarget,
  Conversation,
  ConversationKind,
  Friend,
  Message,
  MessageKind,
  Server,
  User,
} from "../types";

const STORAGE_KEY = "gsc_state_v1";

const now = () => new Date().toISOString();

const createId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const seedState = (): AppState => {
  const users: User[] = [
    { id: "user_alex", fullName: "Alex Rivera", email: "alex@example.com", status: "online" },
    { id: "user_jordan", fullName: "Jordan Lee", email: "jordan@example.com", status: "idle" },
    { id: "user_sam", fullName: "Sam Patel", email: "sam@example.com", status: "online" },
    { id: "user_morgan", fullName: "Morgan Chen", email: "morgan@example.com", status: "offline" },
  ];

  const servers: Server[] = [
    {
      id: "server_lobby",
      name: "Galaxia Lobby",
      color: "#6366f1",
      ownerId: users[0].id,
      memberIds: users.map((user) => user.id),
    },
  ];

  const channels: Channel[] = [
    {
      id: "channel_general",
      serverId: servers[0].id,
      name: "general",
      type: "text",
      description: "General chat",
      participantCount: 3,
      maxParticipants: 25,
    },
    {
      id: "channel_voice",
      serverId: servers[0].id,
      name: "voice",
      type: "voice",
      description: "Voice room",
      participantCount: 0,
      maxParticipants: 15,
    },
  ];

  const conversations: Conversation[] = [
    {
      id: "conversation_alex_jordan",
      name: "",
      type: "direct",
      participantIds: [users[0].id, users[1].id],
      participantNames: [users[0].fullName, users[1].fullName],
      lastMessage: "I can see the local chat now.",
      lastMessageTime: now(),
    },
  ];

  const messages: Message[] = [
    {
      id: "message_seed_1",
      content: "Welcome. This version is running as a local TypeScript app.",
      senderId: users[1].id,
      senderName: users[1].fullName,
      type: "text",
      fileUrl: "",
      conversationId: conversations[0].id,
      createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    },
    {
      id: "message_seed_2",
      content: "I can see the local chat now.",
      senderId: users[0].id,
      senderName: users[0].fullName,
      type: "text",
      fileUrl: "",
      conversationId: conversations[0].id,
      createdAt: conversations[0].lastMessageTime ?? now(),
    },
    {
      id: "message_seed_3",
      content: "The general channel is seeded too.",
      senderId: users[2].id,
      senderName: users[2].fullName,
      type: "text",
      fileUrl: "",
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
  ];

  const friends: Friend[] = [
    {
      id: "friend_alex_jordan",
      requesterId: users[0].id,
      requesterName: users[0].fullName,
      targetId: users[1].id,
      targetName: users[1].fullName,
      status: "accepted",
    },
    {
      id: "friend_sam_alex",
      requesterId: users[2].id,
      requesterName: users[2].fullName,
      targetId: users[0].id,
      targetName: users[0].fullName,
      status: "pending",
    },
  ];

  return { users, servers, channels, conversations, messages, friends };
};

let listeners: Array<() => void> = [];
let cachedState: AppState | null = null;

const readState = (): AppState => {
  if (cachedState) {
    return cachedState;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seeded = seedState();
    writeState(seeded, false);
    return seeded;
  }

  try {
    cachedState = JSON.parse(stored) as AppState;
    return cachedState;
  } catch {
    const seeded = seedState();
    writeState(seeded, false);
    return seeded;
  }
};

const writeState = (state: AppState, notify = true) => {
  cachedState = state;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (notify) {
    listeners.forEach((listener) => listener());
  }
};

const sortByCreatedAt = (messages: Message[]) =>
  [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export const localStore = {
  currentUserId: "user_alex",

  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((item) => item !== listener);
    };
  },

  snapshot() {
    return readState();
  },

  resetDemoData() {
    const seeded = seedState();
    writeState(seeded);
  },

  getCurrentUser() {
    return readState().users.find((user) => user.id === this.currentUserId) ?? null;
  },

  getUsers() {
    return readState().users;
  },

  getServersForUser(userId: string) {
    return readState().servers.filter((server) => server.memberIds.includes(userId));
  },

  getChannels(serverId: string) {
    return readState().channels.filter((channel) => channel.serverId === serverId);
  },

  getConversationsForUser(userId: string) {
    return readState()
      .conversations
      .filter((conversation) => conversation.participantIds.includes(userId))
      .sort((a, b) => {
        const aTime = a.lastMessageTime ?? "";
        const bTime = b.lastMessageTime ?? "";
        return bTime.localeCompare(aTime);
      });
  },

  getMessages(target: ChatTarget | null) {
    if (!target) {
      return [];
    }

    const messages = readState().messages.filter((message) =>
      target.kind === "channel"
        ? message.channelId === target.id
        : message.conversationId === target.id,
    );
    return sortByCreatedAt(messages);
  },

  sendMessage(target: ChatTarget, sender: User, content: string, type: MessageKind = "text", fileUrl = "") {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error("Message content is required.");
    }

    const state = readState();
    const message: Message = {
      id: createId("message"),
      content: trimmed,
      senderId: sender.id,
      senderName: sender.fullName,
      type,
      fileUrl,
      createdAt: now(),
      ...(target.kind === "channel" ? { channelId: target.id } : { conversationId: target.id }),
    };

    const conversations =
      target.kind === "conversation"
        ? state.conversations.map((conversation) =>
            conversation.id === target.id
              ? {
                  ...conversation,
                  lastMessage: trimmed,
                  lastMessageTime: message.createdAt,
                }
              : conversation,
          )
        : state.conversations;

    writeState({ ...state, messages: [...state.messages, message], conversations });
    return message;
  },

  createServer(owner: User, name: string) {
    const state = readState();
    const server: Server = {
      id: createId("server"),
      name,
      color: "#6366f1",
      ownerId: owner.id,
      memberIds: [owner.id],
    };
    const channels: Channel[] = [
      {
        id: createId("channel"),
        serverId: server.id,
        name: "general",
        type: "text",
        participantCount: 0,
        maxParticipants: 25,
      },
      {
        id: createId("channel"),
        serverId: server.id,
        name: "voice",
        type: "voice",
        participantCount: 0,
        maxParticipants: 15,
      },
    ];

    writeState({
      ...state,
      servers: [...state.servers, server],
      channels: [...state.channels, ...channels],
    });

    return { server, channels };
  },

  createConversation(currentUser: User, selectedUsers: User[], name: string) {
    const state = readState();
    const participants = [currentUser, ...selectedUsers];
    const type: ConversationKind = selectedUsers.length > 1 ? "group" : "direct";
    const conversation: Conversation = {
      id: createId("conversation"),
      name: type === "group" ? name.trim() || selectedUsers.map((user) => user.fullName).join(", ") : "",
      type,
      participantIds: participants.map((user) => user.id),
      participantNames: participants.map((user) => user.fullName),
      lastMessage: "",
      lastMessageTime: null,
    };

    writeState({ ...state, conversations: [conversation, ...state.conversations] });
    return conversation;
  },

  getOrCreateDirectConversation(currentUser: User, otherUserId: string) {
    const state = readState();
    const otherUser = state.users.find((user) => user.id === otherUserId);
    if (!otherUser) {
      throw new Error("Could not find that user.");
    }

    const existing = state.conversations.find(
      (conversation) =>
        conversation.type === "direct" &&
        conversation.participantIds.length === 2 &&
        conversation.participantIds.includes(currentUser.id) &&
        conversation.participantIds.includes(otherUser.id),
    );
    if (existing) {
      return existing;
    }

    return this.createConversation(currentUser, [otherUser], "");
  },

  createFriendRequest(currentUser: User, targetUser: User) {
    const state = readState();
    const existing = state.friends.find(
      (friend) =>
        (friend.requesterId === currentUser.id && friend.targetId === targetUser.id) ||
        (friend.requesterId === targetUser.id && friend.targetId === currentUser.id),
    );
    if (existing) {
      return existing;
    }

    const friend: Friend = {
      id: createId("friend"),
      requesterId: currentUser.id,
      requesterName: currentUser.fullName,
      targetId: targetUser.id,
      targetName: targetUser.fullName,
      status: "pending",
    };
    writeState({ ...state, friends: [...state.friends, friend] });
    return friend;
  },

  updateFriendStatus(friendId: string, status: Friend["status"]) {
    const state = readState();
    const friends = state.friends.map((friend) =>
      friend.id === friendId ? { ...friend, status } : friend,
    );
    writeState({ ...state, friends });
  },

  deleteFriend(friendId: string) {
    const state = readState();
    writeState({ ...state, friends: state.friends.filter((friend) => friend.id !== friendId) });
  },
};
