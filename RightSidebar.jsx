import React, { useState, useEffect } from "react";
import { Bell, Calendar, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "message", title: "New message from Alex", desc: "Hey, are you free tonight?", time: "2m ago", unread: true },
  { id: 2, type: "mention", title: "You were mentioned in #general", desc: "@you check the new update!", time: "15m ago", unread: true },
  { id: 3, type: "friend", title: "Friend request", desc: "Jordan wants to be your friend", time: "1h ago", unread: true },
  { id: 4, type: "call", title: "Missed call", desc: "Missed voice call from Sam", time: "3h ago", unread: false },
  { id: 5, type: "message", title: "New message in Gaming Zone", desc: "Game night starts at 8!", time: "5h ago", unread: false },
];

const MOCK_EVENTS = [
  { id: 1, title: "Team Standup", time: "09:00", color: "bg-indigo-500", day: 2 },
  { id: 2, title: "Design Review", time: "11:30", color: "bg-emerald-500", day: 2 },
  { id: 3, title: "Game Night", time: "20:00", color: "bg-purple-500", day: 3 },
  { id: 4, title: "Voice Call - Alex", time: "15:00", color: "bg-blue-500", day: 4 },
  { id: 5, title: "Music Listening Party", time: "18:00", color: "bg-amber-500", day: 5 },
];

function NotificationsPanel({ notifications, onClose }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-white/70" />
          <span className="text-white font-medium text-sm">Notifications</span>
          <span className="text-[10px] bg-indigo-500 text-white px-1.5 rounded-full">
            {notifications.filter((n) => n.unread).length}
          </span>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-3 px-4 py-3 border-b border-white/5 transition-all hover:bg-white/5 cursor-pointer ${
              n.unread ? "bg-indigo-500/5" : ""
            }`}
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? "bg-indigo-400" : "bg-transparent"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium">{n.title}</p>
              <p className="text-white/40 text-xs mt-0.5 truncate">{n.desc}</p>
              <p className="text-white/20 text-[10px] mt-1">{n.time}</p>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/20">
            <Bell size={28} className="mb-2" />
            <p className="text-sm">All caught up!</p>
          </div>
        )}
      </div>
      <button className="text-white/40 hover:text-white/70 text-xs py-2.5 border-t border-white/5 transition-colors">
        Mark all as read
      </button>
    </div>
  );
}

function CalendarPanel({ events, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const today = moment();

  const startOfMonth = currentMonth.clone().startOf("month");
  const endOfMonth = currentMonth.clone().endOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = currentMonth.daysInMonth();

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const todayEvents = events.filter((e) => e.day === today.date() && currentMonth.isSame(today, "month"));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-white/70" />
          <span className="text-white font-medium text-sm">Calendar</span>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1">
          <X size={16} />
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, "month"))} className="text-white/40 hover:text-white/80 p-1">
          <ChevronLeft size={16} />
        </button>
        <span className="text-white/80 text-sm font-medium">{currentMonth.format("MMMM YYYY")}</span>
        <button onClick={() => setCurrentMonth(currentMonth.clone().add(1, "month"))} className="text-white/40 hover:text-white/80 p-1">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="px-3">
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-white/30 font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, i) => {
            const isToday = day === today.date() && currentMonth.isSame(today, "month");
            const dayEvents = day ? events.filter((e) => e.day === day) : [];
            return (
              <div
                key={i}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all ${
                  !day ? "" : isToday ? "bg-indigo-500 text-white font-bold" : "text-white/50 hover:bg-white/5"
                }`}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} className={`w-1 h-1 rounded-full ${e.color}`} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's events */}
      <div className="flex-1 overflow-y-auto mt-2 px-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-2">Today's Events</p>
        {todayEvents.length === 0 ? (
          <p className="text-white/20 text-xs py-4 text-center">No events today</p>
        ) : (
          todayEvents.map((e) => (
            <div key={e.id} className="flex items-center gap-2 py-2 border-b border-white/5">
              <div className={`w-1 h-8 rounded-full ${e.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-xs font-medium truncate">{e.title}</p>
                <p className="text-white/30 text-[10px]">{e.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function RightSidebar({ activeTab, setActiveTab, notifications, events }) {
  const collapsed = !activeTab;

  if (collapsed) {
    return (
      <div className="w-12 bg-[#111122] border-l border-white/5 flex flex-col items-center py-3 gap-1 flex-shrink-0">
        <button
          onClick={() => setActiveTab("notifications")}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all relative ${
            activeTab === "notifications" ? "bg-indigo-500 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/80"
          }`}
        >
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">
            {notifications.filter((n) => n.unread).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            activeTab === "calendar" ? "bg-indigo-500 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/80"
          }`}
        >
          <Calendar size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#111122] border-l border-white/5 flex flex-col flex-shrink-0">
      <AnimatePresence mode="wait">
        {activeTab === "notifications" ? (
          <motion.div key="notif" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <NotificationsPanel notifications={notifications} onClose={() => setActiveTab(null)} />
          </motion.div>
        ) : (
          <motion.div key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <CalendarPanel events={events} onClose={() => setActiveTab(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
