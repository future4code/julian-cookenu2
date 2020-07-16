import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { AddressInfo } from "net";
import IdGenerator from "./services/IdGen.class";
import UserDB, { User } from "./data/UserDB.class";
import RecipesDB, { Recipe } from "./data/RecipesDB.class";
import Authenticator from "./services/Authenticator.class";
import HashManager from "./services/HashManager.class";
dotenv.config();

const app = express();

app.use(express.json());

const server = app.listen(process.env.PORT || 3003, () => {
  if (server) {
    const address = server.address() as AddressInfo;
    console.log(`Server is running in http://localhost:${address.port}`);
  } else {
    console.error(`Failure upon starting server.`);
  }
});

app.post("/signup", async (req: Request, res: Response) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      throw new Error("Invalid input");
    }
    if (req.body.email.indexOf("@") === -1) {
      throw new Error("Invad email address");
    }
    if (req.body.password.lenght < 6) {
      throw new Error("Invalid password lenght");
    }

    const idGen = new IdGenerator();
    const authenticator = new Authenticator();
    const hashManager = new HashManager();
    const userDB = new UserDB();

    const id = idGen.generateId();

    const encryptedPassword = await hashManager.hash(req.body.password);

    const user: User = {
      id: id,
      name: req.body.name,
      email: req.body.email,
      password: encryptedPassword,
    };

    await userDB.createUser(user);

    const access_token = authenticator.generateToken({
      id: id,
      email: user.email,
    });

    res.status(200).send({ access_token });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    if (
      !req.body.email ||
      req.body.email.indexOf("@") === -1 ||
      !req.body.password ||
      req.body.password.lenght < 6
    ) {
      throw new Error("Invalid credentials");
    }

    const userDB = new UserDB();

    const user = await userDB.getByEmail(req.body.email);

    const data = {
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    };

    const hashManager = new HashManager();
    const correctPassword = await hashManager.compare(
      data.password,
      user.password
    );

    if (!correctPassword) {
      throw new Error("Invalid password");
    }

    const authenticator = new Authenticator();
    const access_token = authenticator.generateToken({
      id: user.id,
      email: user.email,
    });

    res.status(200).send({ access_token });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
});

app.get(
  "/user/profile",
  async (req: Request, res: Response): Promise<any> => {
    try {
      if (!req.headers.authorization) {
        throw new Error("Unauthorized");
      }

      const authenticator = new Authenticator();
      const data = authenticator.getData(req.headers.authorization);

      const userDB = new UserDB();
      const user = await userDB.getById(data.id); 

      res.status(200).send({
        "id": `${user.id}`,
        "name": `${user.name}`,
        "email": `${user.email}`
      })
    } catch (err) {
      res.status(400).send({
        message: err.message,
      });
    }
  }
);

app.get(
  "/user/:id",
  async (req: Request, res: Response): Promise<any> => {
    try {
      if (!req.headers.authorization) {
        throw new Error("Unauthorized");
      }
      if (!req.params.id) {
        throw new Error("Missing params");
      }

      const userDB = new UserDB();
      const user = await userDB.getById(req.params.id); 

      res.status(200).send({
        "id": `${user.id}`,
        "name": `${user.name}`,
        "email": `${user.email}`
      })
    } catch (err) {
      res.status(400).send({
        message: err.message,
      });
    }
  }
);

app.post(
  "/recipe",
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.headers.authorization) {
        throw new Error("Unauthorized");
      }
      if (!req.body.title || !req.body.description) {
        throw new Error("Missing fields");
      }

      const authenticator = new Authenticator();
      const creatorData = authenticator.getData(req.headers.authorization);
      
      const creator_id = creatorData.id;

      const idGen = new IdGenerator();
      const id = idGen.generateId();

      const recipe: Recipe = {
        id: id,
        title: req.body.title,
        description: req.body.description,
        creator_id: creator_id
      }
      const recipeBD = new RecipesDB();
      await recipeBD.createRecipe(recipe)

      res.status(200).send({
        message: "Success"
      })
    } catch (err) {
      res.status(400).send({
        message: err.message,
      });
    }
  }
);
