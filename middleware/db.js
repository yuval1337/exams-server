import { connect } from "../mongoose/connector.js"


const connectToDb = async (req, res, next) => {
  const isConnected = await connect()
  if (isConnected) {
    next()
  }
  else {
    console.error("connecting to mongo failed")
    res.sendStatus(500)
  }
}


const db = {
  connectToDb
}
export default db