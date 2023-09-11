import express from "express"
import { default as controllers } from "./controllers.js"
import { default as middleware } from "./middleware.js"


const app = express();
const PORT = 8080;

app.listen(PORT);

const SERVICE = "exams-app-backend"

app.use(
  express.json(),
  middleware.mongoConnect,
)

app.post(
  `/${SERVICE}/login`,
  controllers.login,
)

app.post(
  `/${SERVICE}/register`,
  controllers.register,
)

app.get(
  `/${SERVICE}/get-exams`,
  middleware.verifyToken,
  controllers.getExams,
)

app.post(
  `/${SERVICE}/post-exam`,
  middleware.verifyToken,
  middleware.verifyBearerPrivilege,
  controllers.addExam
)

app.post(
  `/${SERVICE}/post-submission`,
  middleware.verifyToken,
  // middleware.verifyTime,
  controllers.addSubmission
)

app.get(
  `/${SERVICE}/get-submissions`,
  middleware.verifyToken,
  controllers.getSubmissions
)

app.post(
  `/${SERVICE}/delete-exam`,
  middleware.verifyToken,
  middleware.verifyBearerPrivilege,
  controllers.deleteExam
)

app.post(
  `/${SERVICE}/update-exam`,
  middleware.verifyToken,
  middleware.verifyBearerPrivilege,
  controllers.updateExam
)