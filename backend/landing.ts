import path from "path";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const __dirname = path.resolve();


const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/landing/dist")));

  app.get('/user/:username', (req, res: any) => {
    const { username } = req.params;
    res.redirect(301, `http://app.sendchat.xyz/user/${username}`);
  });

  app.get('/user/:username/post/:id', (req, res: any) => {
    const { username, id } = req.params;
    res.redirect(301, `http://app.sendchat.xyz/user/${username}/post/${id}`);
  });

  app.get("*", (req, res: any) => {
    res.sendFile(path.resolve(__dirname, "landing", "dist", "index.html"));
  });
}

export { app };