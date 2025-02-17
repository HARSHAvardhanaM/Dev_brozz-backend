const express = require("express");
require("dotenv")
.config()
const cookieParser = require("cookie-parser")
const {dbConnect} = require("./config/databaseConfig.js");
const authRouter = require("../src/routes/auth.route.js")
const profileRouter = require("../src/routes/profile.route.js")
const connectionRouter = require("../src/routes/connection.route.js");
const userRouter = require("../src/routes/user.route.js")
const cors = require("cors")

const app = express();

dbConnect()
.then(()=>{
    console.log("Database connected successfully");
    app.listen(3000, () => {
        console.log("App is listening on 3000....")
    })
})
.catch((err)=>{
    console.log(`Error while connecting to database ${err}`)
})
const corsOptions = {
    origin : ["http://localhost:5173"],
    credentials : true
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use("/",authRouter)
app.use("/",profileRouter);
app.use("/",connectionRouter);
app.use("/",userRouter)

app.use((err,req,res,next)=>{
    if(err){
        res.status(500).send(err.message)
    }
})

