import type { AppState, ChatTarget, Message, MessageStatus, User } from "../types";

export const targetKey = (target: ChatTarget) => `${target.kind}:${target.id}`;

export const messageTargetKey = (message: Message) =>
  message.channelId ? `channel:${message.channelId}` : `conversation:${message.conversationId ?? ""}`;

export const deriveMessageStatus = (createdAt: string, nowMs: number): MessageStatus => {
  const age = nowMs - new Date(createdAt).getTime();
  if (age < 4000) {
    return "sent";
  }
  if (age < 10000) {
    return "delivered";
  }
  return "read";
};

const mentionsUser = (content: string, user: User) => {
  const firstName = user.fullName.split(" ")[0];
  return new RegExp(`@${firstName}\\b`, "i").test(content);
};

export const extractMentions = (content: string, users: User[]) =>
  users
    .filter((user) => mentionsUser(content, user))
    .map((user) => user.id);

export interface UnreadSummary {
  count: number;
  mentions: number;
}

export const summarizeUnread = (
  state: AppState,
  key: string,
  currentUserId: string,
): UnreadSummary => {
  const lastReadAt = state.lastRead[key] ?? "";
  let count = 0;
  let mentions = 0;

  for (const message of state.messages) {
    if (messageTargetKey(message) !== key || message.senderId === currentUserId) {
      continue;
    }
    if (message.createdAt <= lastReadAt) {
      continue;
    }
    count += 1;
    if (message.mentions?.includes(currentUserId)) {
      mentions += 1;
    }
  }

  return { count, mentions };
};
