const express = require("express");
const mongoose = require("mongoose")
const {userAuth} = require("../utils/middleware");
const ConnectionRequest = require("../models/connectionRequest.model");
const User = require("../models/user.model");
const router = express.Router();

router.get("/user/request/recived",userAuth,async(req,res,next)=>{
    try {
        const user = req.user
        // const request = await ConnectionRequest.find({
        //     toUserId : user._id,
        //     status : "interested"
        // });
        const request = await ConnectionRequest.aggregate([
            {
                $match : {
                    toUserId : new mongoose.Types.ObjectId(user._id),
                    status : "interested" 
                }
            },
            {
                $lookup : {
                    from : "users",
                    localField : "fromUserId",
                    foreignField : "_id",
                    as : "fromUserId",
                    pipeline : [
                        {
                            $project : {
                                imageUrl : 1,
                                firstName : 1,
                                lastName : 1,
                                age : 1,
                                gender : 1,
                                about : 1,
                                skills : 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields : {
                    "fromUserId" : {
                        $arrayElemAt : ["$fromUserId" , 0]
                    }
                }
            }
        ])
        res.send(request)
    } catch (error) {
        next(error)
    }
})

router.get("/user/connections",userAuth,async(req,res,next)=>{
    try {
        const user = req.user;
        const connections = await ConnectionRequest.find({
            $or : [
                {fromUserId : user._id , status : "accepted"},
                {toUserId : user._id , status : "accepted"}
            ]
        }).populate("fromUserId",["firstName", "lastName", "age", "skills", "imageUrl", "gender","about"])
        .populate("toUserId",["firstName", "lastName", "age", "skills", "imageUrl", "gender","about"])
        if(!connections){
            return res.json({message : "No connections found"})
        }
        const data = connections.map(value => {
            if(user._id.toString() === value.fromUserId._id.toString()){
                return value.toUserId 
            }
            return value.fromUserId
        })
        res.status(200).json({
            message : "Connections found successfully",
            data
        })
    } catch (error) {
        next(error)
    }
})

router.get("/user/feeds",userAuth, async(req,res,next)=>{
    try {
        const user = req.user;
        // console.log(user)
        const page = req.query.page || 1;
        let limit = req.query.limit || 10;
        limit = limit > 50 ? 50 : limit;
        const skip  = (page-1)*limit;
        const connectionsPresent = await ConnectionRequest.find({
            $or : [
                {fromUserId : user._id},{toUserId : user._id}
            ]
        }).select("fromUserId toUserId")
        // console.log(connectionsPresent)
        const hideUsers = new Set();
        connectionsPresent.forEach(val => {
            hideUsers.add(val.fromUserId.toString());
            hideUsers.add(val.toUserId.toString());
        })
        // console.log(Array.from(hideUsers))
        const feedUsers = await User.find(
            {
                _id : {
                    $nin : Array.from(hideUsers),
                    $ne : user._id
                },
            }
        ).select("-password -createdAt -updatedAt -email -__v")
        .skip(skip).limit(limit)
        // console.log(feedUsers)
        res.json({
            message : "Users fetched successfully",feedUsers
        })

        //My logic
        // const user = req.user
        // const connections = await ConnectionRequest.find({
        //     $or : [
        //         {fromUserId : user._id},{toUserId : user._id}
        //     ]
        // });
        // let connectionData = connections.map(val => {
        //     if(val.fromUserId.toString() === user._id.toString()){
        //         return val.toUserId
        //     }
        //     return val.fromUserId
        // })
        // const users = await User.aggregate([
        //     {
        //         $match : {
        //             _id : {
        //                 $ne : new mongoose.Types.ObjectId(user._id),
        //                 $nin : connectionData
        //             }
        //         }
        //     },
        //     {
        //         $project : {
        //             firstName : 1,
        //             lastName : 1,
        //             imageUrl : 1,
        //             skills : [],
        //             email : 1
        //         }
        //     }
        // ])
        // if(!users){
        //     throw new Error("Something went wrong in Database")
        // }
        // res.send({message : "Users to show fetched successfully" ,users})
        
    } catch (error) {
        next(error)
    }
})

module.exports = router