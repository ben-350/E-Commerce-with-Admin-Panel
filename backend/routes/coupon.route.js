import expres from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {validateCoupon,getCoupon } from "../controllers/coupon.controller.js"

const router=expres.Router();

router.get("/", protectRoute,getCoupon);
router.post("/validate", protectRoute,validateCoupon);

export default router