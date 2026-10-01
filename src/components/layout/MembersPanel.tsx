import { X } from "lucide-react";
import type { User } from "../../types";

interface MembersPanelProps {
  serverName: string;
  members: User[];
  ownerId: string;
  voiceParticipantIds: string[];
  onClose: () => void;
}

export function MembersPanel({
  serverName,
  members,
  ownerId,
  voiceParticipantIds,
  onClose,
}: MembersPanelProps) {
  const online = members.filter((member) => member.status !== "offline");
  const offline = members.filter((member) => member.status === "offline");

  const renderMember = (member: User) => {
    const inVoice = voiceParticipantIds.includes(member.id);
    return (
      <li key={member.id} className="member-row">
        <span className="avatar member-avatar" aria-hidden="true">
          {member.fullName.charAt(0).toUpperCase()}
          <span className={`presence ${member.status}`} />
        </span>
        <span className="member-copy">
          <strong>{member.fullName}</strong>
          <span className="member-meta">
            {member.id === ownerId && <span className="role-chip">Owner</span>}
            {inVoice && <span className="voice-chip">In voice</span>}
          </span>
        </span>
      </li>
    );
  };

  return (
    <aside className="members-panel" aria-label={`Members of ${serverName}`}>
      <header>
        <h2>Members</h2>
        <button type="button" className="icon-button" aria-label="Hide member list" onClick={onClose}>
          <X aria-hidden="true" size={16} />
        </button>
      </header>
      <div className="members-scroll">
        <section aria-label={`Online members, ${online.length}`}>
          <h3 className="section-label">Online — {online.length}</h3>
          <ul className="member-list">{online.map(renderMember)}</ul>
        </section>
        <section aria-label={`Offline members, ${offline.length}`}>
          <h3 className="section-label">Offline — {offline.length}</h3>
          <ul className="member-list">{offline.map(renderMember)}</ul>
        </section>
      </div>
    </aside>
  );
}
