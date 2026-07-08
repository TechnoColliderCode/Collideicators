import { useState } from "react";
import { Modal } from "./Modal";

interface CreateServerModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreateServerModal({ open, onClose, onCreate }: CreateServerModalProps) {
  const [name, setName] = useState("");

  return (
    <Modal open={open} title="Create a server" onClose={onClose}>
      <form
        className="modal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) {
            return;
          }
          onCreate(name.trim());
          setName("");
        }}
      >
        <label>
          Server name
          <input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
        </label>
        <button type="submit" disabled={!name.trim()}>
          Create server
        </button>
      </form>
    </Modal>
  );
}
