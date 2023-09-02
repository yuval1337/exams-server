export async function create(model, array_of_objects) {
  try {
    const results = await model.insertMany(array_of_objects)
    return results;
  }
  catch (err) {
    throw err
  }
}


export async function read(model, filter) {
  try {
    const result = await model.find(filter)
    return result
  }
  catch (err) {
    throw err
  }
}


export async function update(model, _id, keys_and_values) {
  try {
    const result = await model.findByIdAndUpdate(
      _id,
      { $set: { ...keys_and_values } },
      { new: true }
    )
    return result
  }
  catch (err) {
    throw err
  }
}


export async function update_or_create(model, array_of_objects, key) {
  try {
    // find any existing docs that correspond with argument "key"
    const docs = await model.find({ [key]: { $in: array_of_objects.map(obj => obj[key]) } });

    // an array of docs, will be returned
    const results = []

    // for each object of the argument array, either update its doc or create a new one for it.
    await Promise.all(array_of_objects.map(async obj => {
      const doc = docs.find(item => obj[key] === item[key]);
      var result
      if (doc) {
        // doc already exists, update it
        result = await update(model, doc._id, obj);
      } else {
        // create a new doc
        result = await create(model, [obj]);
      }
      // update the results array
      results.push(result)
    }));

    return results;
  }
  catch (err) {
    throw err;
  }
}


export async function del(model, _id) {
  try {
    const result = await model.findByIdAndDelete(_id)
    return result
  }
  catch (err) {
    throw err
  }
}
