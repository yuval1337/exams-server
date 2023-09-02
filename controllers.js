import dotenv from "dotenv"; dotenv.config();
import bcrypt from "bcrypt";
import * as model from "./models.js";
import * as crud from "./crud.js";
import * as jwt_funcs from "./jwt_funcs.js";
import * as consts from "./consts.js"




export async function register(req, res) {
  try {
    var privilege = "student";
    const { username, password, first_name, surname, invite_code } = req.body
    if (invite_code === process.env.INVITE_CODE) {
      privilege = "lecturer";
    }
    else if (invite_code !== undefined) {
      return res.status(409).send("User registration failed: invalid invite code");
    }

    const [user_doc] = await crud.read(model.User, { username });

    if (!user_doc) {
      const hashed_password = await bcrypt.hash(password, consts.BCRYPT_ROUNDS);
      await crud.create(
        model.User,
        [
          {
            username,
            first_name,
            surname,
            privilege,
            password: hashed_password
          }
        ],
      )
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
    const [user_doc] = await crud.read(model.User, { username });

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
    const _id = req.jwt._id
    const user_doc = await crud.read(model.User, { _id });
    const exam_ids = user_doc[0].exams
    var exams = []
    if (exam_ids.length > 1) {
      // fetch all those exams
      exams = await crud.read(model.Exam, { _id: { $in: exam_ids } })
    }
    return res.status(200).json({ exams })
  }
  catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}

export async function add_exams(req, res) {
  try {
    const exams = JSON.parse(req.body.exams)

    // update existing docs / create new docs.
    const results = await crud.update_or_create(
      model.Exam,
      exams,
      "name"
    )

    // update the user's (that performed the action) exams' doc _id.
    await crud.update(
      model.User,
      req.jwt._id,
      { exams: results.map(doc => doc._id) }
    )

    return res.sendStatus(200)
  }
  catch (err) {
    console.error(err)
    return res.sendStatus(500)
  }
}
