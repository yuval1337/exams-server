import mongoose from "mongoose"


const Submission = mongoose.model(
  "Submission",
  mongoose.Schema(
    {
      date: Date,
      username: String, // submitter's username
      exam_name: String,
      answers:
        [
          {
            question: String,
            selected: String,
            correct: String
          }
        ],
      score: Number
    }
  )
)

const User = mongoose.model(
  "User",
  mongoose.Schema(
    {
      username: String, // unique across the collection, lowercase only
      password: String, // hashed password
      firstName: String, // display name
      lastName: String, // display name
      privilege: String, // student / lecturer / administrator
      exams: [String],
      submissions: [String]
    }
  )
)


const Exam = mongoose.model(
  "Exam",
  mongoose.Schema(
    {
      name: String,
      lecturerFirstName: String,
      lecturerLastName: String,
      start: Date,
      duration: Number,
      shuffle: Boolean,
      questions:
        [
          {
            question: String,
            answers: [String],
            correct: String,
            shuffle: Boolean,
            points: Number
          },
        ],
    }
  )
)


export const models = {
  Submission,
  User,
  Exam
}