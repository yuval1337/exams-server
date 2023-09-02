import express from "express";
import bodyParser from "body-parser"
import { upload } from "./multer.js";
import * as controller from "./controllers.js";
import * as middleware from "./middleware.js";



const app = express();

const PORT = 8080;

app.listen(PORT);

app.use(
  express.json(),
  upload.none(),
  middleware.mongo_connect,
);

app.post(
  "/exams/login",
  controller.login,
);

app.post(
  "/exams/register",
  controller.register,
);

app.get(
  "/exams/fetch",
  middleware.verify_jwt,
  controller.fetch_all_exams,
);

app.post(
  "/exams/add",
  middleware.verify_jwt,
  middleware.verify_bearer_is_lecturer,
  controller.add_exams
);
