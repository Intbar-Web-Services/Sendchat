import path from "path";
import express from "express";
import { server, app } from "./socket/socket.js";
import { app as main } from "./server.js";
import { app as landing } from "./landing.js";
import vhost from "vhost";

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(vhost('legacy.sendchat.xyz', landing) as any);
  app.use(vhost('app.legacy.sendchat.xyz', main) as any);
} else {
  app.use(main);
}

server.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT}`)
);
