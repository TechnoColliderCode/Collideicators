import type { Conversation } from "../types";

export const getConversationName = (conversation: Conversation, currentUserId: string) => {
  if (conversation.name) {
    return conversation.name;
  }

  const otherNames = conversation.participantNames.filter(
    (_, index) => conversation.participantIds[index] !== currentUserId,
  );
  return otherNames.join(", ") || "Conversation";
};
