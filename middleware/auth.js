import { default as jwt } from "../jwt/index.js"


const verifyJwtAll = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")
    if (!authHeader) {
      throw "missing authentication header"
    }
    const token = authHeader.replace("Bearer ", "")
    const parsedJwt = jwt.verify(token)
    if (!parsedJwt) {
      throw "jwt verification failed"
    }
    req.jwt = parsedJwt
    next()
  }
  catch (err) {
    console.error("authentication failed", err)
    return res.status(500).send("authentication failed")
  }
}

const verifyJwtLecturer = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")
    if (!authHeader) {
      throw "missing authentication header"
    }
    const token = authHeader.replace("Bearer ", "")
    const parsedJwt = jwt.verify(token)
    if (!parsedJwt) {
      throw "jwt verification failed"
    }
    if (parsedJwt.privilege !== "lecturer") {
      throw "insufficient privilege"
    }
    req.jwt = parsedJwt
    next()
  }
  catch (err) {
    console.error("authentication failed", err)
    return res.status(500).send("authentication failed")
  }
}


const auth = {
  verifyJwtAll,
  verifyJwtLecturer
}
export default auth