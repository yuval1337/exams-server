import mongoose from "mongoose"


const Submission = mongoose.model(
  "Submission",
  mongoose.Schema({
    date: Date,
    username: String,
    examId: String,
    examName: String,
    answers: [{
      questionId: String,
      selectedAnswer: String,
      correctAnswer: String
    }],
    score: Number
  })
)

const User = mongoose.model(
  "User",
  mongoose.Schema({
    username: String, // unique across the collection, lowercase only
    password: String, // hashed password
    firstName: String, // display name
    lastName: String, // display name
    privilege: String, // student / lecturer / administrator
    exams: [String],
    submissions: [String]
  })
)

const Exam = mongoose.model(
  "Exam",
  mongoose.Schema({
    id: String,
    name: String,
    lecturerFirstName: String,
    lecturerLastName: String,
    start: Date,
    duration: Number,
    shuffle: Boolean,
    questions: [{
      id: String,
      points: Number,
      question: String,
      codeSnippet: String,
      codeLanguage: String,
      answers: [{ id: String, answer: String }],
      correctAnswer: String, // answer id
      shuffle: Boolean
    }]
  }
  )
)


const models = {
  Submission,
  User,
  Exam
}
export default models