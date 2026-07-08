import { useEffect, useState } from "react";
import type { User } from "../../types";
import { Modal } from "./Modal";

interface NewChatModalProps {
  open: boolean;
  users: User[];
  currentUser: User;
  onClose: () => void;
  onCreate: (selectedUsers: User[], groupName: string) => void;
}

export function NewChatModal({
  open,
  users,
  currentUser,
  onClose,
  onCreate,
}: NewChatModalProps) {
  const [selected, setSelected] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const otherUsers = users.filter((user) => user.id !== currentUser.id);

  useEffect(() => {
    if (!open) {
      setSelected([]);
      setGroupName("");
    }
  }, [open]);

  return (
    <Modal open={open} title="New conversation" onClose={onClose}>
      <form
        className="modal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (selected.length === 0) {
            return;
          }
          onCreate(selected, groupName);
        }}
      >
        {selected.length > 1 && (
          <label>
            Group name
            <input value={groupName} onChange={(event) => setGroupName(event.target.value)} />
          </label>
        )}
        <fieldset>
          <legend>Select people</legend>
          <div className="choice-list">
            {otherUsers.map((user) => {
              const isSelected = selected.some((item) => item.id === user.id);
              return (
                <label key={user.id} className="choice-row">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      setSelected((current) =>
                        isSelected
                          ? current.filter((item) => item.id !== user.id)
                          : [...current, user],
                      )
                    }
                  />
                  <span>{user.fullName}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <button type="submit" disabled={selected.length === 0}>
          {selected.length > 1 ? "Create group chat" : "Start chat"}
        </button>
      </form>
    </Modal>
  );
}
