"use client";

import socketUrl from "@/config/socketUrl"; // ✅ Use dedicated socket URL
import {
  addNotification,
  startRinging,
  stopRinging,
} from "@/redux/features/notifications/notificationsSlice";
import { SocketUser } from "@/types";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";

interface iSocketContextType {
  socket: Socket | null;
  isSocketConnected: boolean;
  onlineUsers: SocketUser[]; // Optional
}

export const SocketContext = createContext<iSocketContextType | null>(null);

export const SocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch();

  /* ────────── auth state ────────── */
  const { user } = useSelector((state: any) => state.auth);

  /* ────────── notifications state ────────── */
  const { isRinging } = useSelector((state: any) => state.notifications);

  /* ────────── socket state ────────── */
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);

  /* ────────── bell audio ────────── */
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ────────── create audio once ────────── */
  useEffect(() => {
    audioRef.current = new Audio("/sounds/ball.mp3");
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  /* ────────── connect socket when user ready ────────── */
  useEffect(() => {
    if (!user || !user._id) {
      /* ────────── user নাই => ensure stop ring + cleanup ────────── */
      dispatch(stopRinging());
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    // ✅ No token passed
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);

      /* ────────── Join user's room ────────── */
      newSocket.emit("join-room", user._id);

      setSocket(newSocket);
      setIsSocketConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      setIsSocketConnected(false);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsSocketConnected(false);

      /* ────────── cleanup sound on disconnect ────────── */
      dispatch(stopRinging());
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [user?._id]);

  /* ────────── play/pause sound based on isRinging ────────── */
  useEffect(() => {
    if (!audioRef.current) return;

    if (isRinging) {
      /* ────────── play loop while ringing ────────── */
      audioRef.current.currentTime = 0;

      audioRef.current.play().catch(() => {
        /* ────────── autoplay blocked হলে ignore ──────────
           user interaction (click) হলে পরে বাজবে
        ──────────────────────────────────────────── */
      });
    } else {
      /* ────────── stop ring ────────── */
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isRinging]);

  /* ────────── socket listeners ────────── */
  useEffect(() => {
    if (!socket) return;

    /* ────────── real-time notification ────────── */
    const onUserNotification = (payload: any) => {
      const n = payload?.notification;

      if (n?._id) {
        dispatch(addNotification(n));

        /* ────────── start bell loop until user opens drawer/reads ────────── */
        if (!n?.is_read) dispatch(startRinging());

        toast.success(payload?.message || n?.title || "New notification");
      }
    };

    const onGetUsers = (users: SocketUser[]) => {
      setOnlineUsers(users);
    };

    socket.on("getUsers", onGetUsers);
    socket.on("user-notification", onUserNotification);

    return () => {
      socket.off("getUsers", onGetUsers);
      socket.off("user-notification", onUserNotification);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isSocketConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
