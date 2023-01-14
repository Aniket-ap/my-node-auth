import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// db
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected"))
  .catch((err) => {
    console.log("DB ERROR => ", err);
  });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 64,
  },
});

const User = new mongoose.model("User", userSchema);

// Routes
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      if (password === user.password) {
        res.send({
          message: "Login Successful",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      } else {
        res.send({ error: "Password didnt match" });
      }
    } else {
      res.send({ error: "User Not Found" });
    }
  });
});

app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ error: "User already registred" });
    } else {
      const user = new User({
        name,
        email,
        password,
      });
      user.save((err) => {
        if (err) {
          res.send(err);
        } else {
          res.send({ message: "Successfully registred" });
        }
      });
    }
  });
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log("Backend service start");
});
