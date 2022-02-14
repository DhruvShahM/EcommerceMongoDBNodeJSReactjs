const express=require("express");
const app=express();
const cookieParser=require("cookie-parser");

const errorMiddleWare=require("./middleware/error");
const catchAsyncError=require("./middleware/catchAsyncError");

app.use(express.json());
app.use(cookieParser());

// Route Imports 

const product=require("./routes/productRoute");
const user=require("./routes/userRoute");
const order=require("./routes/orderRoute");

app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);

// Middleware for error
app.use(errorMiddleWare);
app.use(catchAsyncError);

module.exports=app;