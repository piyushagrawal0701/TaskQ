import { io } from "socket.io-client";

export const socket = io("http://localhost:5050", {
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("SOCKET CONNECTED:", socket.id);
});