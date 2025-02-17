const express = require("express");
const { userAuth } = require("../utils/middleware")
const router = express.Router();
const User = require("../models/user.model");
const ConnectionRequest = require("../models/connectionRequest.model");

router.post("/request/send/:status/:toUserId", userAuth, async (req, res, next) => {
    try {
        const { status, toUserId } = req.params;
        const fromUserId = req.user._id;
        if (fromUserId.equals(toUserId)) {
            throw new Error("You canont send request to yourself")
        }
        if(!(["interested","ignored"].includes(status))){
            throw new Error("Invalid request")
        }
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            throw new Error("User not found")
        }
        const prevConnection = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId:toUserId , toUserId: fromUserId }
            ]
        });
        console.log(fromUserId,toUserId)
        console.log(prevConnection)
        if (prevConnection) {
            throw new Error("Request already sent")
        }
        const newReq = new ConnectionRequest({
            fromUserId, toUserId, status
        });
        await newReq.save()
        if (!newReq) {
            throw new Error("Something went wrong while sending connection request")
        }
        res.status(200).json({
            message : `${req.user.firstName} ${status} ${toUser.firstName}`
        })
    } catch (error) {
        next(error)
    }
})

router.post("/request/review/:status/:reviewId",userAuth,async(req,res,next)=>{
    try {
        const {status,reviewId} = req.params;
        const loggedInUser = req.user;
        if(!(["accepted","rejected"].includes(status))){
            throw new Error("Invalid status")
        };
        // const connectionRequest = await ConnectionRequest.findOne({
        //     _id : reviewId,
        //     toUserId : loggedInUser._id,
        //     status : "interested"
        // });
        const connectionRequest = await ConnectionRequest.findOne({
            _id : reviewId,
            toUserId : loggedInUser._id,
            status : "interested"
        });
        if(!connectionRequest){
            throw new Error("No connection found")
        }
        connectionRequest.status = status;
        await connectionRequest.save()
        res.json({
            message :`Request ${status} successfully`,
            data : connectionRequest
        });
    } catch (error) {
        next(error)
    }
})

module.exports = router