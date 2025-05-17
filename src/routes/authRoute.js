import express from "express";
import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import "dotenv/config"


const router = express.Router()

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"})
}

router.post("/register", async (req, res) =>{
    try {
        const {email, username, password} = req.body

        if(!username || !email || !password){
            return res.status(400).json({success: false, message: "All feilds are required!"})
        }

        if(password.length < 6){
            return res.status(400).json({success: false, message: "Password should be at least 6 characters long"})
        }

        if(username.length < 3){
            return res.status(400).json({success: false, message: "Username should be at least 3 characters long"})
        }

        // check if user already exist
        const existingUserName = await User.findOne({username})
        if(existingUserName){
            return res.status(400).json({success: false, message: "Username Already existed!"})
        }

        const existingEmail = await User.findOne({email})
        if(existingEmail){
            return res.status(400).json({success: false, message: "Email Already existed!"})
        }

        const profileImg = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`

        const user = new User({
            username,
            email,
            password,
            profileImg
        })

        await user.save()

        const token = generateToken(user._id)

        res.status(201).json({
            token,
            user:{
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImg: user.profileImg
            }
        })

    } catch (error) {
        console.log("Error in register route", error)
        res.status(500).json({message: "Internal Server error!"})
    }
})

router.post("/login", async (req, res) =>{
    try {
        const {email, password} = req.body

        if(!email || !password) return res.status(400).json({message: "All feilds are required."})

        // check if user exist
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message: "Invalid credentials."})

        // check for the pasword
        const isPasswordCorrect = await user.comparePassword(password)
        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials."})

        const token = generateToken(user._id)

        res.status(200).json({
            token,
            user:{
                id: user._id,
                username: user.username,
                email: user.email,
                profileImg: user.profileImg
            }
        })
                
    } catch (error) {
        console.log("Error in login route", error)
        res.status(500).json({message: "Internal server error"})
        
    }
})

export default router

