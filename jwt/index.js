import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

/**
 * 
 * @param {string} token 
 * @returns {jwt.JWT}
 */
const verify = (token) => jwt.verify(token, process.env.JWT_SECRET)

/**
 * 
 * @param {object} userDoc 
 * @param {number} expiresIn 
 * @returns {object}
 */
const getSigninConfig = (userDoc, expiresIn) => {
  const { username, firstName, lastName, privilege } = userDoc

  const token = jwt.sign(
    { username, privilege },
    process.env.JWT_SECRET,
    { expiresIn: `${expiresIn}m` }
  )

  return {
    token,
    expiresIn,
    tokenType: "Bearer",
    authState: {
      username,
      firstName,
      lastName,
      privilege,
    }
  }
}


const jwtFuncs = {
  getSigninConfig,
  verify
}
export default jwtFuncs