import mongoose from "mongoose"

export const Submission = mongoose.model(
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

export const User = mongoose.model(
  "User",
  mongoose.Schema(
    {
      username: String, // unique across the collection, lowercase only
      password: String, // hashed
      privilege: String, // student / lecturer / administrator
      first_name: String, last_name: String, // display name
      exams: [String],
      submissions: [String]
    }
  )
)


export const Exam = mongoose.model(
  "Exam",
  mongoose.Schema(
    {
      name: String,
      lecturer_firstname: String,
      lecturer_surname: String,
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