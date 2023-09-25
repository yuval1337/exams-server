import bcrypt from "bcrypt" // https://www.npmjs.com/package/bcrypt
import dotenv from "dotenv"

import { default as jwt } from "../jwt/index.js"
import { models } from "../mongoose/index.js"


const register = async (req, res) => {
  try {
    const { username, password, firstName, lastName, inviteCode } = req.body

    console.log(req.body)

    const userExists = await models.User.exists({ username })

    if (userExists) {
      throw "username is taken"
    }

    dotenv.config()
    const privilege = inviteCode === process.env.INVITE_CODE ? "lecturer" : "student"

    const hashedPass = await bcrypt.hash(password, 10)

    const mongoPromise = await models.User({
      username,
      password: hashedPass,
      firstName,
      lastName,
      privilege,
    }).save()

    console.log("user registration successful")
    return res.status(200).send("user registration successful")
  }

  catch (err) {
    console.error(
      "user registration failed",
      err
    )
    res.status(500).send("user registration failed")
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body
    const userDoc = await models.User.findOne({ username })

    if (!userDoc) {
      throw "user not found"
    }

    const passwordMatch = await bcrypt.compare(password, userDoc.password);

    if (!passwordMatch) {
      throw "incorrect password"
    }

    const signInConfig = jwt.getSigninConfig(userDoc, 60 * 60 * 4) // 4 hours
    return res.status(200).send(signInConfig)
  }
  catch (err) {
    console.error("user login failed", err)
    return res.status(500).send("user login failed")
  }
}


const auth = {
  register,
  login,
}
export default auth