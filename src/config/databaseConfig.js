const mongoose = require("mongoose");

const dbConnect = async()=>{
    await mongoose.connect(`${process.env.MONGO_URI}/${process.env.MONGO_SPACE}`)
}

module.exports = {dbConnect}