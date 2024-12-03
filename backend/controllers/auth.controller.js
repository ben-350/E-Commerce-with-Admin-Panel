import { json } from "express";
import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const generateTokens=(userId)=>{
    userId=userId.toString();
    console.log("uid", userId);
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn:"15m"
    })
    
    const refreshToken=jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:"7d",
    })
    return {accessToken,refreshToken}
}

const storeRefreshToken=async (userId,refreshToken)=>{
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60);
} 

const setCookies = (res, accessToken, refreshToken) => {
    console.log('Setting Access Token:', accessToken);
    console.log('Setting Refresh Token:', refreshToken);
    console.log('Current NODE_ENV:', process.env.NODE_ENV);

    const accessCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development",
        sameSite: "None",
        maxAge: 15 * 60 * 1000, // 15 minutes
    };
    
    const refreshCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development",
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Log cookie options for both tokens
    console.log('Access Token Cookie Options:', accessCookieOptions);
    console.log('Refresh Token Cookie Options:', refreshCookieOptions);

    // Set the cookies in the response
    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
}


export const signup=async (req,res)=>{
    const {email, password, name}= req.body;
    try{
        const  userExists=await User.findOne({email});
    if(userExists){
        return res.status(400).json({message:"User already exist"});
    }
    const  user=await User.create({name,email, password})
    //authenticatte
    const {accessToken,refreshToken}=generateTokens(user._id)
    await storeRefreshToken(user.userId,refreshToken)
    setCookies(res,accessToken, refreshToken);

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email:user.email,
        role:user.role
    });

    }catch (error){
        console.log("Error in signup", error.message)
        res.status(500).json({message: error.message})
    }
}
export const login=async (req,res)=>{
try {
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(user && (await user.comparePassword(password))){
        const {accessToken,refreshToken}=generateTokens(user._id)
        await storeRefreshToken(user._id, refreshToken)
        setCookies(res,accessToken,refreshToken)
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
        })
    }else{
        res.status(401).json({message:"Invalid email or password"})
    }
} catch (error) {
    console.log("Error in login",error.message);
    res.status(500).json({message: error.message});
    
}
}

export const logout=async (req,res)=>{
try {    
    const refreshToken=req.cookies.refreshToken;
    if(refreshToken){
        const decoded=jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        await redis.del(`refresh_token:${decoded.userId}`)        
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({message:"Logged out successfully"});
} catch (error) {
    console.log("Error in logout",error.message)
    res.status(500).json({message:"Server error", error:error.message});    
}
};

export const refreshToken=async(req,res)=>{
    try{
        const refreshToken= req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({message:"No refresh token"});
        }
        const decoded =jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken=await redis.get(`refresh_token:${decoded.userId}`);
        if(storedToken!==refreshToken)
        {
            return res.status(401).json({message:"Invalid token"});
        }
        const accessToken=jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"15m"});
        res.cookie("accessToken",accessToken, {httpOnly: true, secure: process.env.NODE_ENV==="production",sameSite:"strict", maxAge: 15*60*1000});
        res.json({message:"Token refreshed successfullly"});
    }
    catch(error){
        console.log("Error in refreshToken controller", error.message);
        res.status(500).json({message:"Server error", error: error.message});

    }
}

export const getProfile= async(req,res)=>{
try {
    res.json(req.user);

} catch (error) {
  res.status(500).json({message:"Server error", error: error.message});  
}
}