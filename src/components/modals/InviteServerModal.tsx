import { Check, Copy, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import type { Server } from "../../types";
import { Modal } from "./Modal";

interface InviteServerModalProps {
  open: boolean;
  server: Server | null;
  onClose: () => void;
  onReset: () => void;
}

export function InviteServerModal({ open, server, onClose, onReset }: InviteServerModalProps) {
  const [copied, setCopied] = useState(false);
  const [lastServer, setLastServer] = useState<Server | null>(null);

  useEffect(() => {
    if (server) {
      setLastServer(server);
    }
  }, [server]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const shown = server ?? lastServer;
  if (!shown) {
    return null;
  }

  const link = `${window.location.origin}/invite/${shown.inviteCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal open={open} title={`Invite friends to ${shown.name}`} onClose={onClose}>
      <div className="modal-form">
        <p className="invite-note">
          Share this link or code. Anyone with an account on this device can redeem it from
          "Join server".
        </p>
        <label>
          Invite link
          <span className="invite-row">
            <input
              readOnly
              value={link}
              onFocus={(event) => event.currentTarget.select()}
              aria-label="Invite link"
            />
            <button type="button" onClick={copyLink}>
              {copied ? (
                <Check aria-hidden="true" size={15} />
              ) : (
                <Copy aria-hidden="true" size={15} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </span>
        </label>
        <p className="invite-code">
          Or share the code: <code>{shown.inviteCode}</code>
        </p>
        <button
          type="button"
          className="invite-reset"
          onClick={() => {
            setCopied(false);
            onReset();
          }}
        >
          <RotateCcw aria-hidden="true" size={15} />
          Reset invite
        </button>
      </div>
    </Modal>
  );
}
