const express=require("express");
const { getAllProducts,createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteProductReviews } = require("../controller/productController");


const {isAuthenticatedUser,authorizeRoles}=require("../middleware/auth");
const router=express.Router();


router.route("/products").get(getAllProducts);
router.route("/products").post(isAuthenticatedUser,authorizeRoles("admin"),createProduct);
router.route("/products/:id").put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct).delete(isAuthenticatedUser,deleteProduct).get(getProductDetails);
router.route("/products/:id").get(getProductDetails);
router.route("/review").put(isAuthenticatedUser,createProductReview);
router.route("/reviews").get(isAuthenticatedUser,getProductReviews).delete(isAuthenticatedUser,deleteProductReviews);


module.exports=router;