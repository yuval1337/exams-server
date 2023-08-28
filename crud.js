export async function create_one(model, data) {
  try {
    const doc = new model(data)
    const result = await doc.save()
    return result
  }
  catch (err) {
    throw err
  }
}

export async function create_many(model, array_of_data) {
  try {
    const results = await Promise.all(array_of_data.map(async data => {
      const doc = new model(data);
      return await doc.save();
    }));
    return results;
  }
  catch (err) {
    throw err
  }
}


export async function read_one(model, filter) {
  try {
    const doc = await model.findOne(filter)
    return doc
  }
  catch (err) {
    throw err
  }
}


export async function read_many(model, filter) {
  try {
    const docs = await model.find(filter)
    return docs
  }
  catch (err) {
    throw err
  }
}


export async function update(model, doc_id, new_key_vals, overwrite = false) {
  try {
    const result = await model.findByIdAndUpdate(
      doc_id,
      overwrite ? { ...new_key_vals } : { $set: { ...new_key_vals } },
      { new: true }
    )
    return result
  }
  catch (err) {
    throw err
  }
}


export async function del(model, doc_id) {
  try {
    const result = await model.findByIdAndDelete(doc_id)
    return result
  }
  catch (err) {
    throw err
  }
}
