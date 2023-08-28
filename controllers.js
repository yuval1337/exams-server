import dotenv from "dotenv"; dotenv.config();
import bcrypt from "bcrypt";
import * as model from "./models.js";
import * as crud from "./crud.js";
import * as jwt_funcs from "./jwt_funcs.js";
import * as consts from "./consts.js"




export async function register(req, res) {
  try {
    var user_type = "student";
    const { username, password, firstname, surname, invitecode } = req.body
    if (invitecode === process.env.INVITE_CODE) {
      user_type = "lecturer";
    }
    else if (invitecode !== undefined) {
      return res.status(409).send("User registration failed: invalid invite code");
    }

    const user_doc = await crud.read_one(model.User, { username });

    if (!user_doc) {
      const hashed_password = await bcrypt.hash(password, consts.BCRYPT_ROUNDS);
      await crud.create_one(
        model.User,
        {
          username,
          firstname,
          surname,
          password: hashed_password,
          type: user_type
        });
      return res.status(200).send("User registration successful");
    }
    return res.status(409).send(`User registration failed: username "${username}" is taken`);

  }
  catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user_doc = await crud.read_one(model.User, { username });

    if (user_doc) {
      const match = await bcrypt.compare(password, user_doc.password);

      if (match) {
        return res.status(200).json({
          message: "User login successful",
          jwt: jwt_funcs.generate(user_doc)
        });
      }
    }

    return res.status(401).send("Login failed: invalid credentials");
  }
  catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

export async function fetch_all_exams(req, res) {
  try {
    // find out which exams are assigned to the user
    const _id = req.jwt.id
    const user_doc = await crud.read_one(model.User, { _id });
    const exam_ids = user_doc.exams
    if (exam_ids.length < 1) {
      return res.status(404).send("User has no associated exams")
    }

    // fetch all those exams
    const exams = await crud.read_many(model.Exam, { id: { $in: exam_ids } })
    return res.status(200).json({ exams })
  }
  catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}

export async function add_exams(req, res) {
  try {
    var result
    const exams = JSON.parse(req.body.exams)
    const exam_names = exams.map(exam => exam.name)

    result = crud.read_many(model.Exam, { name: in exam_names }) // need to modify this

    // exams.map(exam => {
    //   if ()
    // })

    // // add the exams to the "exams" collection.
    // // save an array of the created exam ids.
    // const exam_ids = []
    // result = await crud.create_many(model.Exam, exams)
    // console.log(result)

    // exams.map(exam => exam_ids.push(exam._id))

    // //   update the existing doc with the created array
    // await crud.update(model.User, req.jwt._id, { exams: exam_ids })

    return res.sendStatus(200)
  }
  catch (err) {
    console.error(err)
    return res.sendStatus(500)
  }
}
