const jwt = require("jsonwebtoken")
const User = require("../models/user.model.js")

const userAuth = async function (req,res,next) {
    try {
        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({message : "Invalid token"})
        }
        const decodedData =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        if(!decodedData){
            throw new Error("Invalid token")
        }
        const user = await User.findById(decodedData.id).select("-password");
        if(!user){
            throw new Error("Invalid user")
        }
        req.user = user
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = {userAuth}