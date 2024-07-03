import path from "path";
import express from "express";
import { server, app } from "./socket/socket.ts";
import { app as main } from "./server.ts";
import { app as landing } from "./landing.ts";
import vhost from "vhost";

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(vhost('sendchat.xyz', landing));
  app.use(vhost('app.sendchat.xyz', main));
} else {
  app.use(main);
}

server.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT} \nmeow`)
);