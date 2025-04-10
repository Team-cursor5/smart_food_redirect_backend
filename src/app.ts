import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

export const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});
