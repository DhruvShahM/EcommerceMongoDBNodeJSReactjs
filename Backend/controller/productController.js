const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const Product = require("../models/productModel");
const ApiFetaures = require("../utils/apiFeatures");

// Create the product


// create the products
exports.createProduct = catchAsyncError(async (req, res, next) => {

    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
});

// get all products
exports.getAllProducts = catchAsyncError(async (req, res) => {
    const resultPerPage = 10;
    const productCount = await Product.countDocuments();

    const apiFetaure = new ApiFetaures(Product.find(), req.query).search().filter().pagination(resultPerPage);
    // const products = await Product.find();
    const products = await apiFetaure.query;
    res.status(200).json({
        success: true,
        products,
        productCount
    });
});


// update the products ...admin

exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(500).json({
            succcess: false,
            message: "Product not found"
        })
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success: true,
        product
    })
});


// delete the product

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(500).json({
            success: false,
            message: "Product not found"
        });
    }
    await Product.remove(product);
    res.status(200).json({
        success: true,
        message: "Product deleted successfully..."
    })
});

// Get Product Details

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
    const productDetails = await Product.findById(req.params.id);
    if (!productDetails) {
        return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        message: productDetails
    })
});

// Create new review or update the review

exports.createProductReview = catchAsyncError(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };

    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString());

    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        })
    }
    else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    let avg = 0;
    product.reviews.forEach(rev => {
        avg += rev.rating;
    })
    product.rating = avg / product.reviews.length;
    await product.save({ validateBeforeSave: true });


    return res.status(200).json({
        success: true
    });

})

// Get All Reviews of product
exports.getProductReviews=catchAsyncError(async (req,res,next)=>{
    const product=await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not found"),404);
    }

    const reviews=Product.findById(rev=>rev._id.toString()===req.query.productId.toString());


    res.status(200).json({
        succcess:true,
        reviews:reviews
    })
})


// Delete Review
exports.deleteProductReviews=catchAsyncError(async (req,res,next)=>{
    const product=await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not found"),404);
    }

   const reviews= product.reviews.filter(rev=>rev._id.toString()!==req.query.productId.toString());

    let avg = 0;
    product.reviews.forEach(rev => {
        avg += rev.rating;
    })
    const ratings = avg / reviews.length;

    const numOfReviews=reviews.length;

    await Product.findByIdAndUpdate(req.query.prodcutId,{
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        succcess:true,

    })
})


