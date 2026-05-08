import { useCallback, useRef } from "react";
import { getSocket } from "../utils/socket.js";

export const useTyping = (roomId) => {
  const typingRef = useRef(false);
  const timerRef = useRef(null);

  const emitTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    if (!typingRef.current) {
      typingRef.current = true;
      socket.emit("typing:start", { roomId });
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      typingRef.current = false;
      socket.emit("typing:stop", { roomId });
    }, 2000);
  }, [roomId]);

  const stopTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;
    clearTimeout(timerRef.current);
    if (typingRef.current) {
      typingRef.current = false;
      socket.emit("typing:stop", { roomId });
    }
  }, [roomId]);

  return { emitTyping, stopTyping };
};
