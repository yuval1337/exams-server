import express from "express";
import { upload } from "./multer.js";
import { controllers } from "./controllers.js";
import { middleware } from "./middleware.js";


const app = express();
const PORT = 8080;

app.listen(PORT);

app.use(
  express.json(),
  upload.none(),
  middleware.mongoConnect,
);

app.post(
  "/exams/login",
  controllers.login,
);

app.post(
  "/exams/register",
  controllers.register,
);

app.get(
  "/exams/fetch",
  middleware.verifyToken,
  controllers.fetchExams,
);

app.post(
  "/exams/add",
  middleware.verifyToken,
  middleware.verifyBearerPrivilege,
  controllers.addExams
);
