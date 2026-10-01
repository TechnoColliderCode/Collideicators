import { Bell, Calendar, Plus, Video, X } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import type { Meeting } from "../../types";

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
}

interface RightSidebarProps {
  activeTab: "notifications" | "calendar" | null;
  notifications: NotificationItem[];
  meetings: Meeting[];
  onChangeTab: (tab: "notifications" | "calendar" | null) => void;
  onCreateMeeting: (title: string, startsAt: string) => void;
  onJoinMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (meetingId: string) => void;
}

const toLocalInputValue = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const meetingTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function RightSidebar({
  activeTab,
  notifications,
  meetings,
  onChangeTab,
  onCreateMeeting,
  onJoinMeeting,
  onDeleteMeeting,
}: RightSidebarProps) {
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState(() => toLocalInputValue(new Date(Date.now() + 3600_000)));

  if (!activeTab) {
    return (
      <aside className="right-rail" aria-label="Utilities" data-focus-target="utilities">
        <button type="button" className="icon-button" aria-label="Open notifications" onClick={() => onChangeTab("notifications")}>
          <Bell aria-hidden="true" size={18} />
          {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
        </button>
        <button type="button" className="icon-button" aria-label="Open calendar" onClick={() => onChangeTab("calendar")}>
          <Calendar aria-hidden="true" size={18} />
        </button>
      </aside>
    );
  }

  const scheduleMeeting = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !startsAt) {
      return;
    }
    onCreateMeeting(title.trim(), new Date(startsAt).toISOString());
    setTitle("");
    setStartsAt(toLocalInputValue(new Date(Date.now() + 3600_000)));
  };

  return (
    <aside
      className="right-panel"
      aria-label={activeTab === "notifications" ? "Notifications" : "Calendar"}
      data-focus-target="utilities"
    >
      <header>
        <h2>{activeTab === "notifications" ? "Notifications" : "Calendar"}</h2>
        <button type="button" className="icon-button" aria-label="Close side panel" onClick={() => onChangeTab(null)}>
          <X aria-hidden="true" size={16} />
        </button>
      </header>

      {activeTab === "notifications" ? (
        <div className="utility-list">
          {notifications.length === 0 ? (
            <p className="empty-note">You are all caught up.</p>
          ) : (
            notifications.map((item) => (
              <p key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </p>
            ))
          )}
        </div>
      ) : (
        <div className="meeting-panel">
          <form className="meeting-form" onSubmit={scheduleMeeting}>
            <label>
              New meeting
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Meeting title"
              />
            </label>
            <label>
              Starts at
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </label>
            <button type="submit" className="meeting-create">
              <Plus aria-hidden="true" size={15} />
              Schedule
            </button>
          </form>

          <h3 className="section-label meeting-heading">Upcoming</h3>
          {meetings.length === 0 ? (
            <p className="empty-note utility-list">No meetings scheduled.</p>
          ) : (
            <ul className="meeting-list">
              {meetings.map((meeting) => (
                <li key={meeting.id} className="meeting-item">
                  <span className="meeting-copy">
                    <strong>{meeting.title}</strong>
                    <span>{meetingTime(meeting.startsAt)}</span>
                  </span>
                  <button type="button" className="meeting-join" onClick={() => onJoinMeeting(meeting)}>
                    <Video aria-hidden="true" size={14} />
                    Join
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Delete meeting ${meeting.title}`}
                    onClick={() => onDeleteMeeting(meeting.id)}
                  >
                    <X aria-hidden="true" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}
