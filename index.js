import express from "express"
import { default as controller } from "./controller/index.js"
import { default as middleware } from "./middleware/index.js"

const app = express()
const PORT = 8080
const SERVICE = "exams-app-backend"


app.listen(PORT, () => console.log(`app listening on port ${PORT}`))

app.use(
  express.json(),
  middleware.db.connectToDb,
)

// open endpoints
app.post(
  `/${SERVICE}/login`,
  controller.auth.login,
)

app.post(
  `/${SERVICE}/register`,
  controller.auth.register,
)


// jwt endpoints
app.use(
  `/${SERVICE}/jwt-any/*`,
  middleware.auth.verifyJwtAll,
)

app.get(
  `/${SERVICE}/jwt-any/get-all-exams`,
  controller.db.getAllExams
)

app.get(
  `/${SERVICE}/jwt-any/get-submissions`,
  controller.db.getAllSubmissions
)

app.post(
  `/${SERVICE}/jwt-any/post-submission`,
  controller.db.addSubmission
)


// jwt AND lecturer endpoints
app.use(
  `/${SERVICE}/jwt-lecturer/*`,
  middleware.auth.verifyJwtLecturer,
)

app.get(
  `/${SERVICE}/jwt-lecturer/get-authored-exams`,
  controller.db.getUserExams,
)

app.post(
  `/${SERVICE}/jwt-lecturer/post-exam`,
  controller.db.addExam
)

app.post(
  `/${SERVICE}/jwt-lecturer/delete-exam`,
  controller.db.deleteExam
)

app.post(
  `/${SERVICE}/jwt-lecturer/update-exam`,
  controller.db.updateExam
)