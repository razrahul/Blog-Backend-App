import express from "express";
import {config} from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors";
import ErrorMiddleware from "./middlewares/Error.js";
import morganMiddleware from "./logger/morgan.logger.js";
import swaggerUi from 'swagger-ui-express';
// import swaggerDocument from './swagger-output.json' assert {type:'json'};
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import YAML from "yaml";


config({
    path: "./config/config.env",
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = fs.readFileSync(path.resolve(__dirname, "./swagger.yaml"), "utf8");
const swaggerDocument = YAML.parse(
  file?.replace(
    "- url: ${{server}}",
    `- url: ${process.env.BLOGAPP_HOST_URL || "http://localhost:5000"}/api/v1`
  )
);


const app = express();

//loger
app.use(morganMiddleware);

const corsOptions = {
  origin: [process.env.LOCALHOST_URL, process.env.FRONTEND_URL, process.env.SWAGGER_URL], // Allows all origins
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

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });


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


// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
//   explorer: true,
//   filter: true,
// }));

// * API DOCS
// ? Keeping swagger code at the end so that we can load swagger on "/" route
app.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: "none", // keep all the sections collapsed by default
    },
    customSiteTitle: "Blog App API docs",
  })
);
export default app;

app.use(ErrorMiddleware);