import express from "express";
import { deleteProduct,createProduct,getAllProducts,getFeaturedProducts, getRecomendedProducts, getProductsByCagegory, toggleFeaturedProduct} from "../controllers/product.controller.js";
import { protectRoute,adminRoute } from "../middleware/auth.middleware.js";
const router=express.Router();

router.get("/",protectRoute, adminRoute, getAllProducts)
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCagegory )
router.get("/recommendations", getRecomendedProducts);
router.post("", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;