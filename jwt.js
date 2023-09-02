import jwt from "jsonwebtoken";
import dotenv from "dotenv"; dotenv.config()

const generate = (userDoc, expiresIn = 300) => {
  const { username, firstName, lastName, privilege } = userDoc
  const _id = userDoc.id.toString()

  const payload = {
    _id,
    username,
    privilege
  }

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: `${expiresIn}m` }
  )
  const tokenType = "Bearer"

  const authState = {
    username,
    firstName,
    lastName,
    privilege,
  }

  return {
    token,
    expiresIn,
    tokenType,
    authState
  }
}

const parse = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

export const jwtFuncs = {
  generate,
  parse
}