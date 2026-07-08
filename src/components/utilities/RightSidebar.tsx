import { Bell, Calendar, X } from "lucide-react";

interface RightSidebarProps {
  activeTab: "notifications" | "calendar" | null;
  unreadCount: number;
  onChangeTab: (tab: "notifications" | "calendar" | null) => void;
}

export function RightSidebar({ activeTab, unreadCount, onChangeTab }: RightSidebarProps) {
  if (!activeTab) {
    return (
      <aside className="right-rail" aria-label="Utilities">
        <button type="button" className="icon-button" aria-label="Open notifications" onClick={() => onChangeTab("notifications")}>
          <Bell aria-hidden="true" size={18} />
          <span className="badge">{unreadCount}</span>
        </button>
        <button type="button" className="icon-button" aria-label="Open calendar" onClick={() => onChangeTab("calendar")}>
          <Calendar aria-hidden="true" size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="right-panel" aria-label={activeTab === "notifications" ? "Notifications" : "Calendar"}>
      <header>
        <h2>{activeTab === "notifications" ? "Notifications" : "Calendar"}</h2>
        <button type="button" className="icon-button" aria-label="Close side panel" onClick={() => onChangeTab(null)}>
          <X aria-hidden="true" size={16} />
        </button>
      </header>
      {activeTab === "notifications" ? (
        <div className="utility-list">
          <p><strong>New message from Jordan</strong><span>Local chat is ready to test.</span></p>
          <p><strong>Friend request</strong><span>Sam is waiting for a response.</span></p>
        </div>
      ) : (
        <div className="utility-list">
          <p><strong>Today</strong><span>No real calendar integration yet.</span></p>
          <p><strong>Next step</strong><span>Choose a backend before adding sync.</span></p>
        </div>
      )}
    </aside>
  );
}
