import { models } from "../mongoose/index.js"
import _ from "lodash" // https://lodash.com/docs/4.17.15

import { cleanExams } from "./helpers.js"


const addExam = async (req, res) => {
  try {
    const exam = req?.body?.exam
    const username = req?.jwt?.username
    const examExists = await models.Exam.exists({ id: exam.id })
    if (examExists) {
      throw `exam already exists: ${exam.id}`
    }
    else {
      // save the exam to Exams collection
      const promise1 = await models.Exam({ ...exam, modifiable: true }).save()
      // get the user doc of the lecturer
      const promise2 = await models.User.findOne({ username }).lean()
      // update the lecturer's exams
      const userExams = promise2.exams
      userExams.push(exam.id)
      // reinsert the user doc
      const promise3 = await models.User.findOneAndUpdate({ username }, { $set: { "exams": userExams } })
      // log and return
      console.log("adding exams successful")
      return res.status(200).send("adding exams successful")
    }
  }
  catch (err) {
    console.error(
      "adding exams failed",
      err
    )
    return res.status(500).send("adding exams failed")
  }
}

const addSubmission = async (req, res) => {
  try {
    const username = req.jwt.username
    const { answers, date, examId, examName } = req.body
    const examDoc = await models.Exam.findOne({ id: examId })

    const answersProp = []
    var score = 0

    examDoc.questions.forEach(question => {
      var answer
      if (answers[question.id]) {
        answer = {
          questionId: question.id,
          selectedAnswer: answers[question.id].id,
          correctAnswer: question.correctAnswer
        }
        if (answer.selectedAnswer === answer.correctAnswer) {
          score += question.points
        }
      }
      else { // Submitter did not select any answer for this question.
        answer = {
          questionId: question.id,
          selectedAnswer: null,
          correctAnswer: question.correctAnswer
        }
      }
      answersProp.push(answer)
    })

    const promise1 = await models.Submission({
      date,
      username,
      examId,
      examName,
      answers: answersProp,
      score
    }).save()

    const promise2 = await models.Exam.findOneAndUpdate({ id: examId }, { $set: { "modifiable": false } })
    console.log("adding submission successful")
    return res.status(200).send("adding submission successful")
  }
  catch (err) {
    console.error(
      "adding submission failed",
      err
    )
    return res.status(500).send("adding submission failed")
  }
}

const getAllExams = async (req, res) => {
  try {
    const exams = await models.Exam.find()
    console.info("getting all exams successful")
    return res.status(200).json({ exams })
  }
  catch (err) {
    console.error(
      "getting all exams failed",
      err
    )
    return res.sendStatus(500)
  }
}

const getUserExams = async (req, res) => {
  try {
    // Find out which exams are assigned to the user
    const { username } = req.jwt
    const userDoc = await models.User.findOne({ username })
    if (!userDoc) {
      throw "user document not found in database"
    }
    const examIds = userDoc?.exams
    var exams = []
    if (examIds?.length > 0) {
      // Get all those exams
      exams = await models.Exam.find({ id: { $in: examIds } })
      // Removes sensitive information like correct answer and shuffle.
      if (userDoc?.privilege === "student") { exams = cleanExams(exams) }
    }
    console.log(`getting user exams successful (${username})`)
    return res.status(200).json({ exams })
  }
  catch (err) {
    console.error(`getting user exams failed (${username})`, '\n', err)
    res.status(500).send("getting user exams failed")
  }
}

const getAllSubmissions = async (req, res) => {
  var msg
  try {
    const { username } = req.jwt
    const submissions = await models.Submission.find({ username }).lean()
    const examIds = submissions.map(submission => submission.examId)
    const examDocs = await models.Exam.find({ id: { $in: examIds } })

    // for displaying in the client-side
    const augmentedSubmissions = submissions.map(submission => {

      const exam = examDocs.find(exam => exam.id === submission.examId)
      const augmentedSubmission = { ...submission }

      augmentedSubmission.augmentedAnswers = submission.answers.map(questionSubmit => {
        const questionActual = exam.questions.find(question => question.id === questionSubmit.questionId)
        questionSubmit.repr = {
          question: questionActual.question,
          selectedAnswer: questionActual.answers.find(answer => answer.id === questionSubmit.selectedAnswer)?.answer,
          correctAnswer: questionActual.answers.find(answer => answer.id === questionActual.correctAnswer)?.answer
        }
        return questionSubmit
      })
      return augmentedSubmission
    })

    console.info("getting user submissions successful")
    return res.status(200).json(augmentedSubmissions)
  }
  catch (err) {
    console.error("getting user submissions failed", "\n", err)
    res.status(500).send("getting user submissions failed")
  }
}

const updateExam = async (req, res) => {
  const { exam } = req.body
  const updateResult = await models.Exam.findOneAndUpdate({ id: exam.id }, exam)
  if (updateResult) {
    console.log("exam updating successful")
    return res.status(200).send("exam deletion successful")
  }
  else {
    console.warning("exam updating failed: exam was not found")
    return res.status(404).send("exam deletion failed")
  }
}

const deleteExam = async (req, res) => {
  try {
    const { examId } = req.body
    const deleteResult = await models.Exam.findOneAndDelete({ id: examId })

    if (deleteResult) {
      console.log("exam deletion successful")
      return res.status(200).send("exam deletion successful")
    }
    else {
      console.warning("exam deletion failed: exam was not found.")
      return res.status(404).send("exam deletion failed")
    }
  }
  catch (err) {
    console.error(
      "exam deletion failed",
      err
    )
    res.sendStatus(500)
  }
}


const db = {
  addExam,
  addSubmission,
  getAllSubmissions,
  getUserExams,
  getAllExams,
  deleteExam,
  updateExam
}
export default db