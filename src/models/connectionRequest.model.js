let mongoose  = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    fromUserId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    toUserId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    status : {
        type : String,
        enum : {
            values : ["interested","ignored","accepted","rejected"],
            message : ({value}) => `${value} is not a valid status`
        }
    }
},{timestamps : true});

connectionRequestSchema.index({fromUserId : 1, toUserId : 1});

module.exports = ConnectionRequest = new mongoose.model("ConnectionRequest",connectionRequestSchema)