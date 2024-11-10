import express from "express"
import { userModel } from "../model/users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { transporter } from "../mail_utils/mail_utils.js"

export const usersRouter = express.Router();

usersRouter.post("/", async (req, res) => {
    let { name, email, phone, password } = req.body;
    const userPresent = await userModel.findOne({ $or: [{ email }, { phone }] });
    if (userPresent) {
        res.status(400).json({ msg: "User already exist" });
    }
    else {
        try {
            bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                    res.status(400).json({ msg: `Error - ${err}` });
                }
                else {

                    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                        expiresIn: "1d",
                    });

                    const link = `${process.env.FE_URL}/verifyaccount?token=${token}`;

                    password = hash;
                    const user = new userModel({ name, email, phone, password });
                    const savedUser = await user.save();
                    await transporter.sendMail({
                        to: `${email}`,
                        subject: `Welcome to the Application ${name}`,
                        text: `Hi ${name},  \nTo Verify You account Click ${link}`
                    });
                    res.status(200).json({ msg: `kindly click on activation link shared in mail ${email}` });
                }
            });
        }
        catch (e) {
            res.status(500).json({ msg: "Internal server error" });
        }
    }
});

usersRouter.post("/verifyaccount", async (req, res) => {
    const { token } = req.body;
    jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
        if (err) {
            res.status(400).json({ msg: "Token expired" });
        }
        else {
            const { email } = data;
            const userPresent = await userModel.findOne({ email });
            if (userPresent === null) {
                res.status(400).json({ msg: "Verification failed, user details removed from database, please click sign up link" });
            }
            else {
                await userModel.updateOne({ email }, { isVerified: true, });
                res.status(200).json({ msg: "Verification successfull" })
            }
        }
    })
});

usersRouter.post("/verifyemail", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email, isVerified: true });
        if (user === null) {
            res.status(400).json({ msg: "User not present or not verified" });
        }
        else {
            res.status(200).json({ msg: "Email Verified" });
        }
    }
    catch (e) {
        res.status(500).json({ msg: `server error - ${e}` })
    }

});

usersRouter.post("/getotp", async (req, res) => {
    const { email } = req.body;
    const OTP = Math.floor(Math.random() * 1000000);
    try {
        await transporter.sendMail({
            to: `${email}`,
            subject: `OTP Validation`,
            text: `OTP: ${OTP}`
        });
        await userModel.updateOne({ email }, { OTP });
        res.status(200).json({ msg: `Kindly enter OTP shared in mail ${email}` });
    }
    catch (e) {
        res.status(500).json({ msg: `Server error - ${e}` })
    }
});

usersRouter.post("/updateotp", async (req, res) => {
    const { email } = req.body;
    try {
        await userModel.updateOne({ email }, { OTP: null });
        res.status(200).json({ msg: "OTP updated" });
    }
    catch (e) {
        res.status(500).json({ msg: `server error - ${e}` });
    }
});

usersRouter.post("/updatepassword", async (req, res) => {
    let { email, password, otp } = req.body;
    try {
        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                res.status(400).json({ msg: `Error - ${err}` });
            }
            else {
                password = hash;
                await userModel.updateOne({ email, OTP: otp }, { password });
                res.status(200).json({ msg: "Password updated" });
            }
        }
        );
    }
    catch (e) {
        res.status(500).json({ msg: `OTP expired or server error - ${e}` });
    }
});

usersRouter.post("/validatepassword",async (req,res)=>{
    const {email, password} = req.body;
    try{
    const user = await userModel.findOne({email});
    if(user){
bcrypt.compare(password,user.password,(err,result)=>{
    if(err){
        res.status(400).json({msg:"Entered wrong credentials"});
    }
    else{
        res.status(200).json({msg:"User logged in successfully"});
    }
})
    }
    else{
        res.status(400).json({msg:`mail ID ${email} is not valid`});
    }
}
catch(e){
    res.status(500).json({msg:`Internal server error - ${e}`})
}
})