import mongoose from "mongoose" // https://mongoosejs.com/


/**
* @param {mongoose.Model} model
* @param {object} filter
* @param {object} newKeyVals
* @param {boolean} assertUnique
* @returns {object}
*/
const updateOne = async (model, filter, newKeyVals) => {
  const doc = await model.findOneAndUpdate(
    filter,
    { $set: { ...newKeyVals } }
  )
  console.log(`Update one: ${doc}`)
}

/**
 * 
 * @param {mongoose.Model} model 
 * @param {object} filter 
 * @param {string} key 
 * @param {any} item 
 * @returns {boolean}
 */
const appendToDoc = async (model, _id, key, item) => {
  const doc = await model.findById(_id)
  if (doc) {
    const val = doc[key]
    if (!val.includes(item)) {
      val.push(item) // The value MUST BE an array!
      await model.findByIdAndUpdate(
        _id,
        { $set: { [key]: val } }
      )
    }
  }
  else {
    return false
  }
}

const mongooseFuncs = {
  updateOne,
  appendToDoc
}

export default mongooseFuncs

// const updateOrCreate = async (model, arrayOfObjects, key) => {
//   try {
//     // find any existing docs that correspond with argument "key"
//     const docs = await model.find({ [key]: { $in: arrayOfObjects.map(obj => obj[key]) } })

//     // an array of docs, will be returned
//     const results = []

//     // for each object of the argument array, either update its doc or create a new one for it.
//     await Promise.all(arrayOfObjects.map(async obj => {
//       const doc = docs.find(item => obj[key] === item[key])
//       var result
//       if (doc) {
//         // doc already exists, update it
//         result = await update(model, doc._id, obj)
//       } else {
//         // create a new doc
//         result = await create(model, [obj])
//       }
//       // update the results array
//       results.push(result)
//     }))

//     return results
//   }
//   catch (err) {
//     throw err
//   }
// }