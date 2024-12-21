import express from "express";
import {config} from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors";
import ErrorMiddleware from "./middlewares/Error.js";

config({
    path: "./config/config.env",
  });


const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'https://e-learning5173.netlify.app'], // Allows all origins
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true, // Allows cookies and other credentials to be sent with the request
};



app.use(cors(corsOptions)); // Enable CORS for all origins

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
import blog from "./routes/blogRoutes.js"


app.use("/api/v1", user);
app.use("/api/v1", blog);

export default app;

app.use(ErrorMiddleware);