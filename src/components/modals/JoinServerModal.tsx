import { useEffect, useState } from "react";
import { Modal } from "./Modal";

interface JoinServerModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (input: string) => { ok: boolean; error?: string };
}

export function JoinServerModal({ open, onClose, onJoin }: JoinServerModalProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setValue("");
      setError(null);
    }
  }, [open]);

  return (
    <Modal open={open} title="Join a server" onClose={onClose}>
      <form
        className="modal-form"
        onSubmit={(event) => {
          event.preventDefault();
          const result = onJoin(value);
          if (!result.ok) {
            setError(result.error ?? "That invite is invalid or has expired.");
            return;
          }
          setValue("");
          setError(null);
        }}
      >
        <label>
          Invite link or code
          <input
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
            placeholder="Paste an invite link or code"
            autoFocus
          />
        </label>
        {error && (
          <p className="modal-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={!value.trim()}>
          Join server
        </button>
      </form>
    </Modal>
  );
}
