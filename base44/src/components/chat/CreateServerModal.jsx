import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateServerModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim());
    setName("");
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Create a Server</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-white/60 text-xs">Server Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome server"
              className="bg-white/5 border-white/10 text-white mt-1"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={!name.trim() || loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
            {loading ? "Creating..." : "Create Server"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
