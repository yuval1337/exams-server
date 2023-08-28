import jwt from "jsonwebtoken";
import dotenv from "dotenv"; dotenv.config()

export function generate(user_doc, expiresIn = 300) {
  const { username, firstname, surname } = user_doc
  const _id = user_doc.id.toString()
  const signed_token = jwt.sign(
    {
      _id,
      username,
      firstname,
      surname
    },
    process.env.JWT_SECRET,
    { expiresIn: `${expiresIn}m` }
  )
  return {
    token: signed_token,
    expiresIn: expiresIn,
    tokenType: "Bearer",
    authState: { username: user_doc.name, type: user_doc.type }
  }
}

export function verify_and_parse(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}