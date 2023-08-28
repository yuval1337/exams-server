import mongoose from "mongoose"


export const User = mongoose.model(
  "User",
  mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    surname: String,
    type: String, // student OR lecturer
    exams: [String]
  })
)


export const Exam = mongoose.model(
  "Exam",
  mongoose.Schema({
    subject: String,
    lecturer_firstname: String,
    lecturer_surname: String,
    start: Date,
    duration: Number,
    shuffle: Boolean,
    questions: [
      {
        question: String,
        answers: [String],
        correct: String,
        shuffle: Boolean,
      },
    ],
  })
)