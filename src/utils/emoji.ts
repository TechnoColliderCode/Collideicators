import type { User } from "../types";

export const EMOJI_SHORTCUTS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "😡",
];

export const EMOJI_PICKER = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🙂", "😉",
  "😊", "😍", "🥰", "😘", "😎", "🤓", "🤔", "🫡",
  "👍", "👎", "👏", "🙌", "🤝", "💪", "🙏", "✌️",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🔥",
  "🎉", "🎊", "✨", "⭐", "🚀", "🌍", "🌙", "☕",
  "😮", "😢", "😡", "🤯", "😴", "🥳", "😇", "🤯",
];

export const firstNameOf = (fullName: string) => fullName.split(" ")[0];

export const mentionMatches = (name: string, users: User[]) =>
  users.filter((user) =>
    firstNameOf(user.fullName).toLowerCase().startsWith(name.toLowerCase()),
  );

export interface MentionCandidate {
  query: string;
  start: number;
  end: number;
  userIds: string[];
}

export const findMentionCandidate = (
  value: string,
  position: number,
  users: User[],
  currentUserId: string,
): MentionCandidate | null => {
  const before = value.slice(0, position);
  const match = before.match(/@([A-Za-z]*)$/);
  if (!match) {
    return null;
  }

  const userIds = mentionMatches(match[1], users)
    .filter((user) => user.id !== currentUserId)
    .slice(0, 6)
    .map((user) => user.id);

  if (userIds.length === 0) {
    return null;
  }

  return { query: match[1], start: position - match[0].length, end: position, userIds };
};

