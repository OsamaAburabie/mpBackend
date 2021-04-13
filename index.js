const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

//setup express
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`The server has started on port ${PORT}`));

//setup mongoose
mongoose.connect(
  process.env.MONGODB_CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) throw err;
    console.log("MongoDb connection established");
  }
);

//setup routes
app.use("/users", require("./routes/userRouter"));
// app.use("/admins", require("./routes/adminRouter"));
app.use("/check", require("./routes/tokenChecking"));
