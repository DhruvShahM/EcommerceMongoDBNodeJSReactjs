const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Register a User
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "this is a sample id",
            url: "profilepicurl"
        }
    })

    const token = user.getJWTToken();

    res.status(200).json({
        success: true,
        user,
        token
    })
})

// Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;


    // checking if user has given the password and email both

    if (!email || !password) {
        return next(new ErrorHandler("Please enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, res);

})

// logout user

exports.logout = catchAsyncError(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logout successfully"
    })
})

// Forgot password 

exports.forgotPassword = catchAsyncError(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }


    // Get resetpassword token
    const resetPasswordToken = await user.getResetPasswordToken();
    await user.save({ validateForSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`;
    const message = `Your passsword reset token is: \n\n ${resetPasswordUrl} \n\n If you have not requested this email then,please ignore it`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Ecommerce password recovery',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })
    }
    catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordToken = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }

})


// Reset password 

exports.resetPassword = catchAsyncError(async (req, res, next) => {

    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorHandler("Reset password Token is invalid or has been expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
})

// Get User Details


exports.getUserDetails = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });

})


// Update user password


exports.updatePassword = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('password');

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 401));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match"), 400);
    }

    user.password = req.body.newPassword;

    await user.save();
    sendToken(user, 200, res);


})

// Update user profile

exports.updateProfile = catchAsyncError(async (req, res, next) => {

    const newUserData={
        name:req.body.name,
        email:req.body.email
    };


    // we will add cloudinary later

    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        userFindModify:false
    });


    res.status(200).json({
        success:true,
        user
    })


})

// Get All Users (Admin)

exports.getAllUsers=catchAsyncError(async(req,res,next)=>{

    const users=await User.find();

    res.status(200).json({
        success:true,
        users
    })

})

// Get Single Users (Admin)

exports.getSingleUser=catchAsyncError(async(req,res,next)=>{

    const users=await User.findById(req.params.id);

    if(!users)
     return next(new ErrorHandler(`User does not exist with Id:${req.params.id}`));

    res.status(200).json({
        success:true,
        users
    })

})


// Update user role

exports.updateUserRole = catchAsyncError(async (req, res, next) => {

    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    };


    // we will add cloudinary later

    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        userFindModify:false
    });

    res.status(200).json({
        success:true,
        user
    })

})

// Delete user role

exports.deleteUserRole = catchAsyncError(async (req, res, next) => {

    const user=await User.findById(req.params.id);

    if(!user)
     return next(new ErrorHandler(`User does not exist with id:${req.params.id}`));

     await User.remove(user);

    // we will add cloudinary later

    await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        userFindModify:false
    });


    res.status(200).json({
        success:true,
        user
    })


})