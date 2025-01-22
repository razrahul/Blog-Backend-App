import express from "express";
import {config} from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors";
import ErrorMiddleware from "./middlewares/Error.js";
import morganMiddleware from "./logger/morgan.logger.js";


config({
    path: "./config/config.env",
  });


const app = express();

//loger
app.use(morganMiddleware);

const corsOptions = {
  origin: [process.env.LOCALHOST_URL, process.env.FRONTEND_URL], // Allows all origins
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
import role from "./routes/roleRoutes.js"
import category from "./routes/categoryRoutes.js"
import company from "./routes/companyRoutes.js"
import admin from "./routes/adminRoutes.js"
import subtitle from "./routes/subtitleRoutes.js"


app.use("/api/v1", user);
app.use("/api/v1", blog);
app.use("/api/v1", role);
app.use("/api/v1", category);
app.use("/api/v1", company);
app.use("/api/v1", admin);
app.use("/api/v1", subtitle);

export default app;

app.use(ErrorMiddleware);