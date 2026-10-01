import type { User } from "../../types";
import { firstNameOf } from "../../utils/emoji";

interface MessageTextProps {
  content: string;
  users: User[];
}

export function MessageText({ content, users }: MessageTextProps) {
  const parts = content.split(/@([A-Za-z]+)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          return <span key={`text-${index}`}>{part}</span>;
        }

        const isMention = users.some(
          (user) => firstNameOf(user.fullName).toLowerCase() === part.toLowerCase(),
        );

        return isMention ? (
          <span key={`mention-${index}`} className="mention">
            @{part}
          </span>
        ) : (
          <span key={`at-${index}`}>@{part}</span>
        );
      })}
    </>
  );
}
