import bcryptjs from  "bcryptjs"
import {db} from "../libs/db.js"
import bcrypt from "bcryptjs"
import { UserRole } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"

export const register = async(req,res)=>{
    const {email,password,name} = req.body
    console.log("Sssssssss")

    try {
        const existinguser = await db.user.findUnique({
            where : {
                email 
            }
        })

        if(existinguser){
            return res.status(400).json({error : "user already exist"})
        }

        const hashedPassword = await bcrypt.hash(password,10);
         
        const newUser  = await db.user.create({
            data : {
                email,
                password : hashedPassword ,
                name,
                role:UserRole.USER

            }
        })

      const token = jwt.sign({id:newUser.id},process.env.JWT_SECRET , 
        {expiresIn : "7d"}
      )

      res.cookie("jwt",token, {
        httpOnly : true ,
        smaeSite : "strict",
        secure : process.env.NODE_ENV !== "development",
        maxAge : 1000 * 60 * 60 * 24 * 7 //sec *  min * hou * day
      }) 
      .status(201)
      .json({
        success : true ,
        message : "User is created successfully",
        user : {
            id : newUser.id,
            email : newUser.email,
            name : newUser.name ,
            role : newUser.role,
            image : newUser.image
        }
      })

        
    } catch (error) {
        console.error("Error creating User:",error);
        res.status(500).json({
           error : "Error creating user" 
        })
    }
}

export const login = async(req,res)=>{
    const {email , password} = req.body;
    try {
        const user = await db.user.findUnique({
            where : {
                email
            }
        })

    if(!user){
        return res.status(401).json({error : "user not found"})
    }
        console.log("user",user)
     const ispasswordCorrect = await bcrypt.compare(password,user.password);

     if(!ispasswordCorrect){
        throw res.status(401)
         .json({
            error : "Invalid credentials"
         })
     }

     const token = jwt.sign({id : user.id},process.env.JWT_SECRET,{
        expiresIn : "7d"
     })

      res.cookie("jwt",token,{
        httpOnly : true ,
        smaeSite : "strict",
        secure : process.env.NODE_ENV !== "development",
        maxAge : 1000 * 60 * 60 * 24 * 7
      })

      res.status(200)
       .json({
        success : true ,
        message : "user login Successfully",
        user : {
            id : user.id,
            email : user.email,
            name :user.name ,
        }
       })
        
    } catch (error) {
        console.log("Errr login user",error)
        res.status(500).json({
            error : "Error loginUser user"
        })
    }
}

export const logout = async(req,res)=>{
    try {
       res.clearCookie("jwt",{
        httpOnly : true ,
        smaeSite : "strict",
        secure : process.env.NODE_ENV !== "development"
       })
       res.status(200).json({
        success : true,
        message : "logged out successfully"})
        
    } catch (error) {
          console.log("Errr logout  user",error)
          res.status(500).json({
            error : "Error Logout user"
         })
     }
}

export const check = async(req,res)=>{
    try {
        res.status(200)
         .json({
            success : true,
            message : "user Authenticated successfully",
            user : req.user
         })
        
    } catch (error) {
        console.error("error checking: ",error)
        res.status(500).json({
            error : "Error checking user"
        })
    }
}