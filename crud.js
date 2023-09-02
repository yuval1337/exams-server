const create = async (model, arrayOfObjects) => {
  try {
    const results = await model.insertMany(arrayOfObjects)
    return results
  }
  catch (err) {
    throw err
  }
}

const read = async (model, filter) => {
  try {
    const result = await model.find(filter)
    return result
  }
  catch (err) {
    throw err
  }
}

const update = async (model, _id, keysAndValues) => {
  try {
    const result = await model.findByIdAndUpdate(
      _id,
      { $set: { ...keysAndValues } },
      { new: true }
    )
    return result
  }
  catch (err) {
    throw err
  }
}

const updateOrCreate = async (model, arrayOfObjects, key) => {
  try {
    // find any existing docs that correspond with argument "key"
    const docs = await model.find({ [key]: { $in: arrayOfObjects.map(obj => obj[key]) } })

    // an array of docs, will be returned
    const results = []

    // for each object of the argument array, either update its doc or create a new one for it.
    await Promise.all(arrayOfObjects.map(async obj => {
      const doc = docs.find(item => obj[key] === item[key])
      var result
      if (doc) {
        // doc already exists, update it
        result = await update(model, doc._id, obj)
      } else {
        // create a new doc
        result = await create(model, [obj])
      }
      // update the results array
      results.push(result)
    }))

    return results
  }
  catch (err) {
    throw err
  }
}

const deleteOne = async (model, _id) => {
  try {
    const result = await model.findByIdAndDelete(_id)
    return result
  }
  catch (err) {
    throw err
  }
}


export const crud = {
  create,
  read,
  update,
  updateOrCreate,
  deleteOne
}