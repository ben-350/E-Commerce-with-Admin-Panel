import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute=async(req,res,next)=>{
    try{console.log("Accrss",req.cookies.accessToken);
    
        const accesstoken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
        if(!accesstoken){
            return res.status(401).json({message:"Unauthorized - No Token provided"});            
        }
      try{
        const decoded =jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET);
        const user= await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({message:"User not found", err});
        }
        req.user=user;
        next();

      }catch(error){
        if(error.name==="TokenExpireError"){
            return res.status(401).json({message:"Unauthorized-Access token expired"});
        }throw error
      }
    }catch(error){
        console.log("Error in ProtectedRoute middleware", error.message);
        return res.status(401).json({message:"Unauthorized-invalid access token"});
    };
}

export const adminRoute=async(req,res,next)=>{
    if(req.user && req.user.role ==="admin"){
        next()
    }else{
        return res.status(403).json({message:"Access denied-Admin only"});
    }
}