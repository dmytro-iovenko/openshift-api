import express from "express";
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors())

app.get("/", (req, res) => {
  res.json("It works!");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server is running on port: " + PORT);
});
