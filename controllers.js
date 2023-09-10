import dotenv from "dotenv"
import bcrypt from "bcrypt" // https://www.npmjs.com/package/bcrypt
import _ from "lodash" // https://lodash.com/docs/4.17.15

import { default as models } from "./models.js"
import { default as mongooseFuncs } from "./mongooseFuncs.js"
import { default as jwtFuncs } from "./jwtFuncs.js"
import { default as logger } from "./logger.js"
import * as consts from "./consts.js"

dotenv.config()


const register = async (req, res) => {
  var msg
  try {
    var privilege = "student";
    const { username, password, firstName, lastName, inviteCode } = req.body

    // register as lecturer
    if (inviteCode) {
      if (inviteCode === process.env.INVITE_CODE) {
        privilege = "lecturer";
      }
      else {
        msg = "User registration failed: invalid invite code."
        return res.status(401).send(msg);
      }
    }

    const userExists = await models.User.exists({ username });

    if (userExists) {
      msg = `User registration failed: username "${username}" is taken`
      logger.error(msg)
      return res.status(409).send(msg)
    }
    else {
      const hashedPass = await bcrypt.hash(password, consts.BCRYPT_ROUNDS);
      await mongooseFuncs.create(
        models.User,
        [
          {
            username,
            password: hashedPass,
            firstName,
            lastName,
            privilege,
          }
        ],
      )
      msg = "User registration successful."
      logger.info(msg)
      return res.status(200).send(msg)
    }
  }

  catch (err) {
    msg = `User registration failed: ${err}`
    logger.error(msg)
    res.sendStatus(500)
  }
}

const login = async (req, res) => {
  var msg
  try {
    const { username, password } = req.body
    const userDoc = await models.User.findOne({ username })

    if (userDoc) {
      const match = await bcrypt.compare(password, userDoc.password);
      const signInConfig = jwtFuncs.generate(userDoc)
      if (match) {
        msg = "User login successful."
        logger.info(msg)
        return res.status(200).send(signInConfig)
      }
    }
    else {
      msg = "User login failed: Invalid credentials."
      logger.error(msg)
      return res.status(401).send(msg)
    }
  }
  catch (err) {
    msg = `User login failed:\n${err}`
    logger.error(msg)
    return res.sendStatus(500)
  }
}

const getExams = async (req, res) => {
  var msg
  try {
    // Find out which exams are assigned to the user
    const { _id, username } = req.jwt
    const userDoc = await models.User.findOne({ _id })
    if (userDoc) {
      const examIds = userDoc.exams
      var exams = []
      if (examIds.length > 0) {
        // Get all those exams
        exams = await models.Exam.find({ id: { $in: examIds } })
        // Removes sensitive information like correct answer and shuffle.
        if (userDoc.privilege === "student") { exams = cleanExams(exams) }
      }
      msg = `[${username}] Getting user exams successful.`
      logger.info(msg)
      return res.status(200).json({ exams })
    }
    else {
      msg = `[${username}] Getting user exams failed: user document not found.`
      logger.info(msg)
      return res.sendStatus(500)
    }
  }
  catch (err) {
    msg = `Getting user exams failed: ${err}`
    logger.error(msg)
    res.sendStatus(500)
  }
}

const addExam = async (req, res) => {
  var msg
  try {
    const exam = req.body
    const examDoc = await models.Exam.exists({ id: exam.id })
    if (!examDoc) {
      await models.Exam(exam).save()
      await mongooseFuncs.appendToDoc(
        models.User,
        req.jwt._id, // user doc's _id
        "exams",
        exam.id
      )
    }
    msg = `[${req.jwt.username}] Adding exams successful.`
    logger.info(msg)
    return res.sendStatus(200)
  }
  catch (err) {
    msg = `Adding exams failed:\n${err}`
    logger.error(msg)
    return res.sendStatus(500)
  }
}

const cleanExams = (examsArray) => (
  examsArray.map(
    exam => {
      if (exam.shuffle) { exam.questions = _.shuffle(exam.questions) }
      exam.shuffle = undefined

      exam.questions = exam.questions.map(
        question => {
          if (question.shuffle) { question.answers = _.shuffle(question.answers) }
          question.shuffle = undefined
          question.correct = undefined
          return question
        }
      )
      return exam
    }
  )
)

const addSubmission = async (req, res) => {
  var msg
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

    const insertResult = await models.Submission({
      date,
      username,
      examId,
      examName,
      answers: answersProp,
      score
    }).save()

    console.log(insertResult)

    msg = "Adding submission successful."
    logger.info(msg)
    return res.status(200).json({ msg })
  }
  catch (err) {
    msg = "Adding submission failed:" + err
    logger.error(msg)
    return res.sendStatus(500).json({ msg })
  }
}

const getSubmissions = async (req, res) => {
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

    msg = `[${username}] Getting user submissions successful.`
    logger.info(msg)
    return res.status(200).json(augmentedSubmissions)
  }
  catch (err) {
    msg = `Getting user submissions failed: ${err}`
    logger.error(msg)
    res.sendStatus(500)
  }
}


export default {
  register,
  login,
  getExams,
  addExam,
  addSubmission,
  getSubmissions
}