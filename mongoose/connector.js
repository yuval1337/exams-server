import mongoose from "mongoose"

import { URI } from "./consts.js"


export const connect = async () => {
  try {
    const promise = await mongoose.connect(URI)
    return true
  }
  catch (err) {
    console.error("connecting to mongo failed", err)
    return false
  }
}
