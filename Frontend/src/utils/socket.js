import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("SOCKET CONNECTED:", socket.id);
});