import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { useSocket } from "../hooks/useSocket.js";

export default function Home() {
  const [activeRoom, setActiveRoom] = useState(null);

  useSocket();

  return (
    <div className="h-screen flex overflow-hidden bg-dark-900">
      <Sidebar
        onSelectRoom={setActiveRoom}
        activeRoomId={activeRoom?._id}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeRoom ? (
          <ChatWindow key={activeRoom._id} room={activeRoom} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Select a conversation to start chatting</p>
              <p className="text-gray-600 text-xs mt-1">or search for someone in the sidebar</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
