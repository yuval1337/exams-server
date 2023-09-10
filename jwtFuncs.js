import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()


const generate = (userDoc, expiresIn = 300) => {
  const { _id, username, firstName, lastName, privilege } = userDoc

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

export default {
  generate,
  parse
}