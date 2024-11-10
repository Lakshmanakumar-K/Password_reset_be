import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config();

//const localurl = "mongodb://localhost:27017";
const dbname = "password_reset";

const cloudurl = `mongodb+srv://${process.env.UNAME}:${process.env.PASS}@cluster0.tr1m5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

export const connectViaMongoose = async () => {
    try {
        await mongoose.connect(`${cloudurl}/${dbname}`);
        console.log("connected via mongoose");
    }
    catch (e) {
        console.log("connection failed with error" + " " + e);
        process.exit(1);
    }
}