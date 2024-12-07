import express from "express";
import {config} from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors";

config({
    path: "./config/config.env",
  });


const app = express();

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}))

//using middlewares
app.use(express.json());
app.use(
  express.urlencoded({
      extended: true,
  })
)

app.use(cookieParser());

// Importing & using Routes
import user from "./routes/userRoutes.js"


app.use("/api/v1", user);

export default app;