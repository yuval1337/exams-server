import mongoose from "mongoose";

import { jwtFuncs } from "./jwt.js"
import { models } from "./models.js"
import { crud } from "./crud.js"
import { logger } from "./logger.js"
import * as consts from "./consts.js"


const mongoConnect = async (req, res, next) => {
  try {
    await mongoose.connect(consts.MONGO_URI)
    next()
  }
  catch (err) {
    logger.error("Connecting to Mongo via mongoose failed:" + err)
    res.sendStatus(500)
  }
}

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || authHeader === "") {
      return res.status(401).send("Authentication failed: check auth header");
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
    const query = await crud.read(
      models.User,
      {
        username: req.jwt.username,
        privilege: "lecturer"
      }
    )
    if (query.length === 0) {
      msg = "Authentication failed: insufficient permissions."
      logger.error(msg)
      return res.status(403).send(msg)
    }
    next()
  }
  catch (err) {
    msg = "Authentication failed:" + err
    logger.error(msg)
    return res.sendStatus(500)
  }
}


export const middleware = {
  mongoConnect,
  verifyToken,
  verifyBearerPrivilege
}