import { Router } from "express";
import adminCategoryController from "../../../controllers/admin/adminCategoryController.ts";
import { validate } from "../../../middlewares/validate.ts";
import { adminCreateCategorySchema } from "../../../schemas/admin/category/createCategory.ts";


const router = Router();

// 생성이라는건, 프론트엔드에서 값을 받아와함으로
router.post("/create", validate(adminCreateCategorySchema), adminCategoryController.createCategory);
router.get("/list", adminCategoryController.getCategoryList);

export default router;