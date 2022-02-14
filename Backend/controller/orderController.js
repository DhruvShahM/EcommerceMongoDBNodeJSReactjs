const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorHandler");
const Product = require("../models/productModel");
const ApiFetaures = require("../utils/apiFeatures");
const catchAsyncError = require("../middleware/catchAsyncError");

// Create new order
exports.newOrder = catchAsyncError(async (req, res, next) => {

    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shipingPrice, totalPrice } = req.body;

    const order = await Order.create({
        shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shipingPrice, totalPrice, paidAt: Date.now(), user: req.user._id
    });

    res.status(201).json({
        success: true,
        order
    });

})


// get single order

exports.getSingleOrder = catchAsyncError(async (req, res, next) => {

    const order = await Order.findById(req.params.id);
    // const order=await Order.findById(req.params.id).populate("user","name email");
    if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
    }

    res.status(200).json({
        success: true,
        order
    });

})

// get logged in user order

exports.myOrders = catchAsyncError(async (req, res, next) => {

    const order = await Order.find({ user: req.user._id });
    // const order=await Order.findById(req.params.id).populate("user","name email");
    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        order
    });

})


// get all orders-admin

exports.getAllOrders = catchAsyncError(async (req, res, next) => {

    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });


    // const order=await Order.findById(req.params.id).populate("user","name email");
    if (!orders) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    });

})


// update order status-admin

exports.updateOrders = catchAsyncError(async (req, res, next) => {

    const orders = await Order.findById(req.params.id);

    if (orders.orderStatus === "Delivered")
        return next(new ErrorHandler("You have alreday delivered this order", 400));

    orders.orderItems.forEach(async (o) => {
        await updateStock(o.product, o.quantity);
    });

    orders.orderStatus = req.body.status;

    if (req.body.status === "Delivered")
        orders.deliveredAt = Date.now();

    await orders.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    });

})

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.stock -= quantity;

    await product.save({ validateBeforeSave: false });
}

// delete order-Admin

exports.deleteOrder = catchAsyncError(async (req, res, next) => {

    const orders = await Order.findById(req.params.id);
    
    if (!orders) {
        return next(new ErrorHandler("Order not found", 404));
    }

    await orders.remove();
  

    res.status(200).json({
        success: true
    });

})