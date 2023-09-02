import mongoose from "mongoose";
import * as jwt_funcs from "./jwt_funcs.js"
import * as model from "./models.js"
import * as crud from "./crud.js"
import * as consts from "./consts.js"



export async function mongo_connect(req, res, next) {
  try {
    await mongoose.connect(consts.MONGO_URI);
    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

export function verify_jwt(req, res, next) {
  const auth_header = req.header("Authorization");

  if (!auth_header || auth_header === "") {
    return res.status(401).send("Authentication failed: check auth header");
  }

  const token = auth_header.replace("Bearer ", "")

  try {
    req.jwt = jwt_funcs.verify_and_parse(token)
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).send("Authentication failed: invalid token");
  }
}

export async function verify_bearer_is_lecturer(req, res, next) {
  try {
    const query = await crud.read(
      model.User,
      {
        username: req.jwt.username,
        type: "lecturer"
      }
    )
    if (query.length === 0) {
      throw `no lecturer named "${req.jwt.username}"`
    }
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).send("Authentication failed: no permissions");
  }
}

export async function success(message) {
  res.status(200).send(message)
}