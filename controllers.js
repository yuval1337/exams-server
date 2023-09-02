import dotenv from "dotenv"
import bcrypt from "bcrypt"

import { models } from "./models.js"
import { crud } from "./crud.js"
import { jwtFuncs } from "./jwt.js"
import { logger } from "./logger.js"
import * as consts from "./consts.js"

dotenv.config()


const register = async (req, res) => {
  var msg
  try {
    var privilege = "student";
    const { username, password, firstName, lastName, inviteCode } = req.body
    if (inviteCode === process.env.INVITE_CODE) {
      privilege = "lecturer";
    }
    else if (inviteCode !== undefined) {
      msg = "User registration failed: invalid invite code."
      return res.status(409).send(msg);
    }

    const [userDoc] = await crud.read(models.User, { username });

    if (!userDoc) {
      const hashedPass = await bcrypt.hash(password, consts.BCRYPT_ROUNDS);
      await crud.create(
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
    msg = `User registration failed: username "${username}" is taken`
    logger.error(msg)
    return res.status(409).send(msg)
  }
  catch (err) {
    msg = "User registration failed: " + err
    logger.error(msg)
    res.sendStatus(500)
  }
}

const login = async (req, res) => {
  var msg
  try {
    const { username, password } = req.body
    const [userDoc] = await crud.read(models.User, { username })

    if (userDoc) {
      const match = await bcrypt.compare(password, userDoc.password);
      const signInConfig = jwtFuncs.generate(userDoc)
      if (match) {
        msg = "User login successful."
        logger.info(msg)
        return res.status(200).send(signInConfig)
      };
    }
    msg = "User login failed: invalid credentials."
    logger.error(msg)
    return res.status(401).send(msg)
  }
  catch (err) {
    msg = "User login failed: " + err
    logger.error(msg)
    return res.sendStatus(500)
  }
}

const fetchExams = async (req, res) => {
  var msg
  try {
    // find out which exams are assigned to the user
    const _id = req.jwt._id
    const userDoc = await crud.read(models.User, { _id });
    const examIds = userDoc[0].exams
    var exams = []
    if (examIds.length > 1) {
      // fetch all those exams
      exams = await crud.read(models.Exam, { _id: { $in: examIds } })
    }
    msg = "Fetch exams successful."
    logger.info(msg)
    return res.status(200).json({ exams })
  }
  catch (err) {
    msg = "Fetch exams failed:\n" + err
    logger.error(msg)
    res.sendStatus(500)
  }
}

const addExams = async (req, res) => {
  var msg
  try {
    const exams = JSON.parse(req.body.exams)

    // update existing docs / create new docs.
    const results = await crud.updateOrCreate(
      models.Exam,
      exams,
      "name"
    )

    // update the user's (that performed the action) exams' doc _id.
    await crud.update(
      models.User,
      req.jwt._id,
      { exams: results.map(doc => doc._id) }
    )
    msg = "Adding exams successful."
    logger.info(msg)
    return res.status(200).send(msg)
  }
  catch (err) {
    msg = "Adding exams failed:\n" + err
    logger.error(msg)
    return res.sendStatus(500)
  }
}


export const controllers = {
  register,
  login,
  fetchExams,
  addExams
}