import moment from "moment"


const info = (msg) => {
  console.info(`[${moment().format('HH:mm:ss')}] ${msg}`)
}

const error = (msg) => {
  console.error(`[${moment().format('HH:mm:ss')}] ${msg}`)
}


export const logger = {
  info,
  error
}