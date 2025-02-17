let mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value)
            },
            message: `Invalid email `,
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: (value) => {
                return validator.isStrongPassword(value)
            },
            message: `Password is week `,
        }
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    skills: {
        type: [String]
    },
    imageUrl: {
        type: String,
        default: "https://imgs.search.brave.com/MTUDx5fbbs1n-hWoetY5s5xC5eBhK81oxU_Ul2jzzIU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxNS8x/MC8wNS8yMi8zNy9i/bGFuay1wcm9maWxl/LXBpY3R1cmUtOTcz/NDYwXzY0MC5wbmc"
    },
    about: {
        type: String
    },
    gender: {
        type: String,
        enum: ["male", "female", "others"],
        validate: {
            validator: function (value) {
                return (["male", "female", "others"].includes(value))
            },
            message: "The values must be 'male' , 'female' , 'others'"
        }
    }
},
    { timestamps: true }
)

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    return next();
})

userSchema.methods.isPasswordCorrect= async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateJwt = async function(){
    const token = jwt.sign({id : this._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn : process.env.ACCESS_TOKEN_EXPIRY})
    return token;
}

module.exports = new mongoose.model("User", userSchema)