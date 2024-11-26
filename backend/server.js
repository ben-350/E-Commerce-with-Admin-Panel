//1:07

import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors"; 


import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from"./routes/coupon.route.js"
import paymentRoutes from"./routes/payment.route.js"
import analyticsRoutes from"./routes/analytics.route.js"

dotenv.config();

const app=  express();
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true, 
}));

app.use(express.json({limit:"10mb"}));
app.use(cookieParser());

const PORT=process.env.PORT || 6000

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);    
app.use("/api/cart", cartRoutes);    
app.use("/api/coupons", couponRoutes);    

app.use("/api/payments", paymentRoutes);    


app.use("/api/analytics", analyticsRoutes);    
//c

app.listen(PORT, ()=>{
 console.log("Server is running on http://localhost:"+ PORT );
 connectDB();
})

