import { useState } from "react";
import { formatTime } from "../utils/format.js";
import Avatar from "./Avatar.jsx";

export default function MessageBubble({ message, isOwn, onDelete, onEdit }) {
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message._id, editContent.trim());
    }
    setEditing(false);
  };

  if (message.isDeleted) {
    return (
      <div className={`flex gap-2 mb-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
        <div className="w-8 flex-shrink-0" />
        <p className="text-xs text-gray-600 italic px-1">Message deleted</p>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-2 mb-3 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); }}
    >
      {!isOwn && (
        <Avatar
          src={message.sender?.avatar}
          name={message.sender?.username}
          size="sm"
        />
      )}

      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1 px-1">
            {message.sender?.username}
          </span>
        )}

        {editing ? (
          <div className="flex gap-2 w-full">
            <input
              className="input-base text-sm flex-1"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              autoFocus
            />
            <button onClick={handleEdit} className="btn-primary text-xs px-3">
              Save
            </button>
          </div>
        ) : (
          <div
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              isOwn
                ? "bg-accent text-white rounded-tr-sm"
                : "bg-dark-600 text-gray-100 rounded-tl-sm"
            }`}
          >
            {message.content}
            {message.editedAt && (
              <span className="text-xs opacity-60 ml-2">(edited)</span>
            )}
          </div>
        )}

        <span className="text-xs text-gray-600 mt-1 px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>

      {isOwn && showActions && !editing && (
        <div className="flex items-center gap-1 self-center">
          <button
            onClick={() => setEditing(true)}
            className="text-gray-500 hover:text-gray-300 text-xs p-1 rounded"
            title="Edit"
          >
            edit
          </button>
          <button
            onClick={() => onDelete(message._id)}
            className="text-gray-500 hover:text-red-400 text-xs p-1 rounded"
            title="Delete"
          >
            del
          </button>
        </div>
      )}
    </div>
  );
}
