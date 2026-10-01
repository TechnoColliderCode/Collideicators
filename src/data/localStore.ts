import type {
  AppState,
  Channel,
  ChatTarget,
  Conversation,
  ConversationKind,
  Friend,
  Message,
  MessageKind,
  Meeting,
  PresenceStatus,
  ReplyRef,
  Server,
  User,
  VoiceSession,
} from "../types";
import { extractMentions } from "../utils/chat";

const STORAGE_KEY = "gsc_state_v1";

export interface AuthResult {
  ok: boolean;
  error?: string;
  userId?: string;
}

const now = () => new Date().toISOString();

const createId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const hashPassword = (password: string) => {
  const input = `gsc:${password}`;
  let first = 0x811c9dc5;
  let second = 0x1000193;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    first = Math.imul(first ^ code, 16777619) >>> 0;
    second = Math.imul(second + code + index, 2654435761) >>> 0;
  }
  return `${first.toString(16).padStart(8, "0")}${second.toString(16).padStart(8, "0")}`;
};

const emptyVoice = (): VoiceSession => ({
  channelId: null,
  participantIds: [],
  muted: false,
  deafened: false,
});

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
      type: "voice",
      description: "Main voice room",
      participantCount: 0,
      maxParticipants: 25,
    },
    {
      id: "channel_voice",
      serverId: servers[0].id,
      name: "lounge",
      type: "voice",
      description: "Casual voice room",
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
      reactions: [{ emoji: "👍", userId: users[0].id }],
      pinned: false,
      replyTo: null,
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
      reactions: [],
      pinned: false,
      replyTo: {
        messageId: "message_seed_1",
        senderName: users[1].fullName,
        content: "Welcome. This version is running as a local TypeScript app.",
      },
    },
    {
      id: "message_seed_3",
      content: "The general channel is seeded too. Pin messages with the pin action.",
      senderId: users[2].id,
      senderName: users[2].fullName,
      type: "text",
      fileUrl: "",
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      reactions: [],
      pinned: true,
      replyTo: null,
    },
    {
      id: "message_seed_4",
      content: "@Alex can you take a look at the new mockups?",
      senderId: users[2].id,
      senderName: users[2].fullName,
      type: "text",
      fileUrl: "",
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 1000 * 60).toISOString(),
      reactions: [],
      pinned: false,
      replyTo: null,
      mentions: [users[0].id],
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

  const meetings: Meeting[] = [
    {
      id: "meeting_standup",
      title: "Galaxia standup",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      hostId: users[0].id,
      participantIds: [users[0].id, users[1].id, users[2].id],
    },
    {
      id: "meeting_design",
      title: "Design review",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
      hostId: users[1].id,
      participantIds: [users[0].id, users[1].id],
    },
  ];

  return {
    currentUserId: null,
    users,
    servers,
    channels,
    conversations,
    messages,
    friends,
    lastRead: {},
    voice: emptyVoice(),
    meetings,
    typing: {},
  };
};

const normalizeState = (parsed: Partial<AppState>): AppState => {
  const seeded = seedState();
  const users = parsed.users ?? seeded.users;

  return {
    currentUserId: parsed.currentUserId ?? null,
    users,
    servers: parsed.servers ?? seeded.servers,
    channels: parsed.channels ?? seeded.channels,
    conversations: parsed.conversations ?? seeded.conversations,
    messages: (parsed.messages ?? seeded.messages).map((message) => ({
      ...message,
      reactions: message.reactions ?? [],
      pinned: message.pinned ?? false,
      replyTo: message.replyTo ?? null,
      mentions: message.mentions ?? [],
      editedAt: message.editedAt ?? null,
      unsent: message.unsent ?? false,
    })),
    friends: parsed.friends ?? seeded.friends,
    lastRead: parsed.lastRead ?? {},
    voice: parsed.voice ?? emptyVoice(),
    meetings: parsed.meetings ?? seeded.meetings,
    typing: {},
  };
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
    cachedState = normalizeState(JSON.parse(stored) as Partial<AppState>);
    return cachedState;
  } catch {
    const seeded = seedState();
    writeState(seeded, false);
    return seeded;
  }
};

const writeState = (state: AppState, notify = true) => {
  cachedState = state;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, typing: {} }));
  if (notify) {
    listeners.forEach((listener) => listener());
  }
};

const sortByCreatedAt = (messages: Message[]) =>
  [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

const requireMessage = (state: AppState, messageId: string) => {
  const message = state.messages.find((item) => item.id === messageId);
  if (!message) {
    throw new Error("Could not find that message.");
  }
  return message;
};

const replyPayload = (message: Message): ReplyRef => ({
  messageId: message.id,
  senderName: message.senderName,
  content: message.unsent ? "Message unsent" : message.content,
});

export const localStore = {
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
    const previousSession = readState().currentUserId;
    const seeded = seedState();
    seeded.currentUserId = seeded.users.some((user) => user.id === previousSession)
      ? previousSession
      : null;
    writeState(seeded);
  },

  login(identifier: string, password: string): AuthResult {
    const query = identifier.trim().toLowerCase();
    if (!query || !password) {
      return { ok: false, error: "Enter your email and password." };
    }

    const state = readState();
    const user = state.users.find(
      (candidate) =>
        candidate.email.toLowerCase() === query || candidate.fullName.toLowerCase() === query,
    );

    if (!user || !user.passwordHash || user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: "Incorrect email or password." };
    }

    writeState({ ...state, currentUserId: user.id });
    return { ok: true, userId: user.id };
  },

  register(username: string, email: string, password: string): AuthResult {
    const name = username.trim();
    const mail = email.trim().toLowerCase();

    if (name.length < 2) {
      return { ok: false, error: "Username must be at least 2 characters." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      return { ok: false, error: "Enter a valid email address." };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }

    const state = readState();
    if (state.users.some((candidate) => candidate.email.toLowerCase() === mail)) {
      return { ok: false, error: "That email is already registered." };
    }

    const user: User = {
      id: createId("user"),
      fullName: name,
      email: mail,
      status: "online",
      passwordHash: hashPassword(password),
    };

    const servers = state.servers.map((server) =>
      server.id === "server_lobby" && !server.memberIds.includes(user.id)
        ? { ...server, memberIds: [...server.memberIds, user.id] }
        : server,
    );

    writeState({
      ...state,
      users: [...state.users, user],
      servers,
      currentUserId: user.id,
    });
    return { ok: true, userId: user.id };
  },

  logout() {
    const state = readState();
    writeState({ ...state, currentUserId: null, typing: {} });
  },

  getCurrentUserId() {
    return readState().currentUserId;
  },

  getCurrentUser() {
    return readState().users.find((user) => user.id === readState().currentUserId) ?? null;
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

  sendMessage(
    target: ChatTarget,
    sender: User,
    content: string,
    type: MessageKind = "text",
    fileUrl = "",
    replyTo?: ReplyRef | null,
  ) {
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
      reactions: [],
      pinned: false,
      replyTo: replyTo ?? null,
      editedAt: null,
      unsent: false,
      mentions: extractMentions(trimmed, state.users),
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

  toggleReaction(messageId: string, userId: string, emoji: string) {
    const state = readState();
    const message = requireMessage(state, messageId);
    const hasReaction = message.reactions.some(
      (reaction) => reaction.emoji === emoji && reaction.userId === userId,
    );

    const reactions = hasReaction
      ? message.reactions.filter(
          (reaction) => !(reaction.emoji === emoji && reaction.userId === userId),
        )
      : [...message.reactions.filter((reaction) => reaction.userId !== userId), { emoji, userId }];

    writeState({
      ...state,
      messages: state.messages.map((item) =>
        item.id === messageId ? { ...item, reactions } : item,
      ),
    });
  },

  togglePin(messageId: string) {
    const state = readState();
    const message = requireMessage(state, messageId);
    writeState({
      ...state,
      messages: state.messages.map((item) =>
        item.id === messageId ? { ...item, pinned: !message.pinned } : item,
      ),
    });
  },

  editMessage(messageId: string, editor: User, content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error("Message content is required.");
    }

    const state = readState();
    const message = requireMessage(state, messageId);
    if (message.senderId !== editor.id) {
      throw new Error("You can only edit your own messages.");
    }

    writeState({
      ...state,
      messages: state.messages.map((item) =>
        item.id === messageId
          ? {
              ...item,
              content: trimmed,
              editedAt: now(),
              mentions: extractMentions(trimmed, state.users),
            }
          : item,
      ),
    });
  },

  unsendMessage(messageId: string, requester: User) {
    const state = readState();
    const message = requireMessage(state, messageId);
    if (message.senderId !== requester.id) {
      throw new Error("You can only unsend your own messages.");
    }

    writeState({
      ...state,
      messages: state.messages.map((item) =>
        item.id === messageId
          ? { ...item, unsent: true, reactions: [], editedAt: null }
          : item,
      ),
    });
  },

  markRead(key: string) {
    const state = readState();
    writeState({ ...state, lastRead: { ...state.lastRead, [key]: now() } });
  },

  setTyping(key: string, userId: string | null) {
    const state = readState();
    const typing = { ...state.typing };
    if (userId) {
      typing[key] = userId;
    } else {
      delete typing[key];
    }
    writeState({ ...state, typing });
  },

  updateUserStatus(userId: string, status: PresenceStatus) {
    const state = readState();
    writeState({
      ...state,
      users: state.users.map((user) => (user.id === userId ? { ...user, status } : user)),
    });
  },

  joinVoice(channelId: string, userId: string) {
    const state = readState();
    const participantIds = state.voice.channelId === channelId
      ? state.voice.participantIds
      : [userId];

    writeState({
      ...state,
      voice: { ...state.voice, channelId, participantIds },
    });
  },

  leaveVoice() {
    const state = readState();
    writeState({ ...state, voice: emptyVoice() });
  },

  addVoiceParticipant(userId: string) {
    const state = readState();
    if (!state.voice.channelId || state.voice.participantIds.includes(userId)) {
      return;
    }
    writeState({
      ...state,
      voice: {
        ...state.voice,
        participantIds: [...state.voice.participantIds, userId],
      },
    });
  },

  setVoiceSetting(patch: Partial<Pick<VoiceSession, "muted" | "deafened">>) {
    const state = readState();
    writeState({ ...state, voice: { ...state.voice, ...patch } });
  },

  createMeeting(host: User, title: string, startsAt: string, participantIds: string[]) {
    const state = readState();
    const meeting: Meeting = {
      id: createId("meeting"),
      title: title.trim() || "Quick meeting",
      startsAt,
      hostId: host.id,
      participantIds: participantIds.includes(host.id)
        ? participantIds
        : [host.id, ...participantIds],
    };
    writeState({ ...state, meetings: [...state.meetings, meeting] });
    return meeting;
  },

  deleteMeeting(meetingId: string) {
    const state = readState();
    writeState({ ...state, meetings: state.meetings.filter((item) => item.id !== meetingId) });
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
        type: "voice",
        participantCount: 0,
        maxParticipants: 25,
      },
      {
        id: createId("channel"),
        serverId: server.id,
        name: "lounge",
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

export { replyPayload };
