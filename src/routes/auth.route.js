const express = require("express");
const User = require("../models/user.model.js")
const {signupValidator} = require("../utils/validators.js")
const router = express.Router();

router.post("/signup",async(req,res,next)=>{
    try {
        const data = req.body
        signupValidator(data)
        if(data.skills?.length > 10){
            throw new Error("Skills must not be greater than 10")
        }
        const user = new User(req.body);
        const savedUser = await user.save();
        const token = await savedUser.generateJwt();
        res.cookie("token",token,{maxAge : 24 * 3600000});
        res.json({
            message : "Login sucess",
            user : savedUser
        })
        res.json({
            message : "Login sucess",
            user : savedUser
        })
    } catch (error) {
        next(error)
    }
})

router.post("/login",async(req,res,next)=>{
try {
    const {email="",password=""} = req.body;
    if(!([email,password].every(val=>val?.trim()!==""))){
        throw new Error("All fields are required")
    }
    const userRetrived = await User.findOne({email : email});
    if(!userRetrived){
        throw new Error("Invalid credentials")
    }
    const isCorrect = await userRetrived.isPasswordCorrect(password);
    userRetrived.password = undefined;
    if(isCorrect){
        const token = await userRetrived.generateJwt();
        res.cookie("token",token,{maxAge : 24 * 3600000});
        res.json({
            message : "Login sucess",
            user : userRetrived
        })
    }
    else{
        throw new Error("Invalid credentials")
    }
} catch (error) {
    next(error)
}
});

router.post("/logout",async(req,res)=>{
    res.cookie("token",null,{maxAge : 0})
    .send("logout successfull")
})

module.exports = router