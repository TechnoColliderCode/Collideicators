import { Check, Search, UserPlus, X } from "lucide-react";
import { useState } from "react";
import type { Friend, User } from "../../types";

interface FriendsViewProps {
  users: User[];
  friends: Friend[];
  currentUser: User;
  onStartConversation: (userId: string) => void;
  onCreateFriendRequest: (targetUser: User) => void;
  onAcceptFriend: (friendId: string) => void;
  onDeleteFriend: (friendId: string) => void;
}

export function FriendsView({
  users,
  friends,
  currentUser,
  onStartConversation,
  onCreateFriendRequest,
  onAcceptFriend,
  onDeleteFriend,
}: FriendsViewProps) {
  const [tab, setTab] = useState<"online" | "all" | "pending" | "add">("online");
  const [search, setSearch] = useState("");

  const accepted = friends.filter((friend) => friend.status === "accepted");
  const pending = friends.filter((friend) => friend.status === "pending");
  const onlineFriends = accepted.filter((friend) => {
    const otherId = friend.requesterId === currentUser.id ? friend.targetId : friend.requesterId;
    return users.some((user) => user.id === otherId && user.status === "online");
  });

  const usersToAdd = users.filter((user) => {
    const alreadyConnected = friends.some(
      (friend) =>
        (friend.requesterId === currentUser.id && friend.targetId === user.id) ||
        (friend.targetId === currentUser.id && friend.requesterId === user.id),
    );
    return (
      user.id !== currentUser.id &&
      !alreadyConnected &&
      user.fullName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const visibleFriends = tab === "online" ? onlineFriends : tab === "all" ? accepted : pending;

  return (
    <section className="friends-panel" aria-labelledby="friends-heading">
      <header className="chat-header">
        <div className="chat-heading-group">
          <UserPlus aria-hidden="true" size={20} />
          <h1 id="friends-heading">Friends</h1>
        </div>
      </header>
      <div className="tabs" role="tablist" aria-label="Friend views">
        {[
          { id: "online", label: "Online", count: onlineFriends.length },
          { id: "all", label: "All", count: accepted.length },
          { id: "pending", label: "Pending", count: pending.length },
          { id: "add", label: "Add Friend", count: 0 },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? "selected" : ""}
            onClick={() => setTab(item.id as typeof tab)}
          >
            {item.label}
            {item.count > 0 && <span>{item.count}</span>}
          </button>
        ))}
      </div>

      <div className="friends-list">
        {tab === "add" ? (
          <>
            <label className="search-field add-search">
              <span className="sr-only">Search users</span>
              <Search aria-hidden="true" size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" />
            </label>
            {usersToAdd.map((user) => (
              <div key={user.id} className="friend-row">
                <span className="avatar" aria-hidden="true">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
                <span>{user.fullName}</span>
                <button type="button" onClick={() => onCreateFriendRequest(user)}>
                  Add
                </button>
              </div>
            ))}
            {usersToAdd.length === 0 && <p className="empty-note">No users found.</p>}
          </>
        ) : visibleFriends.length === 0 ? (
          <p className="empty-note">Nothing to show here yet.</p>
        ) : (
          visibleFriends.map((friend) => {
            const isRequester = friend.requesterId === currentUser.id;
            const otherId = isRequester ? friend.targetId : friend.requesterId;
            const otherName = isRequester ? friend.targetName : friend.requesterName;
            return (
              <div key={friend.id} className="friend-row">
                <span className="avatar" aria-hidden="true">
                  {otherName.charAt(0).toUpperCase()}
                </span>
                <span className="friend-copy">
                  <strong>{otherName}</strong>
                  <span>{friend.status}</span>
                </span>
                {friend.status === "pending" && !isRequester ? (
                  <>
                    <button type="button" aria-label={`Accept ${otherName}`} onClick={() => onAcceptFriend(friend.id)}>
                      <Check aria-hidden="true" size={16} />
                    </button>
                    <button type="button" aria-label={`Decline ${otherName}`} onClick={() => onDeleteFriend(friend.id)}>
                      <X aria-hidden="true" size={16} />
                    </button>
                  </>
                ) : friend.status === "accepted" ? (
                  <button type="button" onClick={() => onStartConversation(otherId)}>
                    Message
                  </button>
                ) : (
                  <button type="button" onClick={() => onDeleteFriend(friend.id)}>
                    Cancel
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
