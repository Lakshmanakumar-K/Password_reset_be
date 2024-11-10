import express from "express"
import cors from "cors"
import { connectViaMongoose } from "./db_utils/mongoose.js"
import { usersRouter } from "./routes/auth.js";

const server = express();

server.use(express.json());
server.use(cors());

const PORT = 3500;

server.use("/auth",usersRouter);

await connectViaMongoose();

server.listen(PORT, () => {
    console.log("server listening on port 3500")
});