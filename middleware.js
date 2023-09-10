import mongoose from "mongoose";

import { default as jwtFuncs } from "./jwtFuncs.js"
import { default as model } from "./models.js"
import { default as myMongoose } from "./mongooseFuncs.js"
import { default as logger } from "./logger.js"
import * as consts from "./consts.js"


const mongoConnect = async (req, res, next) => {
  try {
    await mongoose.connect(consts.MONGO_URI)
    next()
  }
  catch (err) {
    logger.error("Connecting to Mongo via mongoose.js failed:" + err)
    res.sendStatus(500)
  }
}

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || authHeader === "") {
      return res.status(401).send("Authentication failed: Check authentication header.");
    }
    const token = authHeader.replace("Bearer ", "")
    req.jwt = jwtFuncs.parse(token)
    next()
  }
  catch (err) {
    var msg = "Authentication failed: invalid token"
    logger.error(msg)
    return res.status(401).send(msg)
  }
}

const verifyBearerPrivilege = async (req, res, next) => {
  var msg
  try {
    if (req.jwt.privilege !== "lecturer") {
      msg = "Authentication failed: not a privileged user."
      logger.error(msg)
      return res.status(403).send(msg)
    }
    next()
  }
  catch (err) {
    msg = `Authentication failed: ${err}`
    logger.error(msg)
    return res.sendStatus(500)
  }
}

const middleware = {
  mongoConnect,
  verifyToken,
  verifyBearerPrivilege
}

export default middleware