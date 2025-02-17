const validator = require("validator")

const signupValidator = function(data){
    const {firstName="",lastName="",email="",password=""} = data;
    if(!([firstName,lastName,email,password].every(val => val.trim() !== ""))){
        throw new Error("All fields are required")
    }
    if(firstName.length < 4 || firstName.length > 50){
        throw new Error("Firstname should be 4-50 chars")
    }
    else if(!(validator.isEmail(email))){
        throw new Error("Email is not valid")
    }
    else if(!(validator.isStrongPassword(password))){
        throw new Error("Password is weak")
    }
}

const editValidator = function(req){
    const isValidUpdate = ["firstName","lastName","email","skills","age","about","gender","imageUrl"];
    if(!(Object.keys(req.body).every(key => isValidUpdate.includes(key)))){
        throw new Error("Invalid update fields")
    }
    else if(req.body.skills?.length > 10){
        throw new Error("You can add upto 10 skills")
    }
    else{
        return true
    }
}

module.exports = {signupValidator,editValidator}