import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

export default function NewChatModal({ open, onClose, onCreateConversation, currentUser }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      base44.entities.User.list().then(setUsers);
    }
  }, [open]);

  const otherUsers = users.filter((u) => u.id !== currentUser?.id);

  const handleCreate = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    const isGroup = selected.length > 1;
    const participantIds = [currentUser.id, ...selected.map((u) => u.id)];
    const participantNames = [currentUser.full_name || currentUser.email, ...selected.map((u) => u.full_name || u.email)];
    await onCreateConversation({
      name: isGroup ? groupName || participantNames.slice(1).join(", ") : "",
      type: isGroup ? "group" : "direct",
      participants: participantIds,
      participant_names: participantNames,
    });
    setSelected([]);
    setGroupName("");
    setLoading(false);
    onClose();
  };

  const toggleUser = (user) => {
    setSelected((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {selected.length > 1 && (
            <div>
              <Label className="text-white/60 text-xs">Group Name (optional)</Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
          )}
          <div>
            <Label className="text-white/60 text-xs mb-2 block">Select People</Label>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {otherUsers.map((user) => {
                const isSelected = selected.find((u) => u.id === user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => toggleUser(user)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isSelected ? "bg-indigo-500/20 border border-indigo-500/40" : "bg-white/5 hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {(user.full_name || user.email)?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-sm text-white/80">{user.full_name || user.email}</span>
                  </button>
                );
              })}
              {otherUsers.length === 0 && (
                <p className="text-white/30 text-sm text-center py-4">No other users found</p>
              )}
            </div>
          </div>
          <Button onClick={handleCreate} disabled={selected.length === 0 || loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
            {loading ? "Creating..." : selected.length > 1 ? "Create Group Chat" : "Start Chat"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
