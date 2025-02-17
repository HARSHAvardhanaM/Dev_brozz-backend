const express = require("express");
const {userAuth} = require("../utils/middleware");
const {editValidator} = require("../utils/validators");
const User = require("../models/user.model");
const router = express.Router();
const validator = require("validator")

router.get("/profile/view",userAuth,async(req,res,next)=>{
    try {
        const {token} = req.cookies;
        if(!token){
            throw new Error("No token found")
        }
        const userFound = req.user
        if(!userFound){
            throw new Error("Invalid token")
        }
        res.send(userFound)
    } catch (error) {
        next(error)
    }
})

router.patch("/profile/edit",userAuth,async (req,res,next)=>{
    try {
        editValidator(req);
        const data = req.body;
        const updatingUser = req.user;
        Object.keys(data).forEach(key => {updatingUser[key] = data[key]})
        await updatingUser.save();
        res.status(200).json({
            message : `${updatingUser.firstName} Updated successfully`,
            data : updatingUser
        })
    } catch (error) {
        next(error)
    }
})

router.patch("/profile/password",userAuth,async(req,res,next)=>{
    try {
        const user = req.user;
        let updatableUser = await User.findOne({_id : user._id});
        const {prevPassword, newPassword} = req.body;
        const isPasswordCorrect = await updatableUser.isPasswordCorrect(prevPassword);
        if(!isPasswordCorrect){
            throw new Error("Password is incorrect")
        }
        if(!validator.isStrongPassword(newPassword)){
            throw new Error("New password is not strong")
        }
        updatableUser.password = newPassword;
        await updatableUser.save();
        res.status(200).send(`${updatableUser.firstName}'s password updated`)
    } catch (error) {
        next(error)
    }
})

module.exports = router