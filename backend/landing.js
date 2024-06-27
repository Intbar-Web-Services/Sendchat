import path from "path";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const __dirname = path.resolve();


const app = express();

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "landing", "dist", "index.html"));
  });
}

export { app };