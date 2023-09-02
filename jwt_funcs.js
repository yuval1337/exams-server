import jwt from "jsonwebtoken";
import dotenv from "dotenv"; dotenv.config()

export function generate(user_doc, expiresIn = 300) {
  const { username, display_name } = user_doc
  const _id = user_doc.id.toString()

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
    display_name,
    privilege,
  }

  return {
    token,
    expiresIn,
    tokenType,
    authState
  }
}

export function verify_and_parse(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}