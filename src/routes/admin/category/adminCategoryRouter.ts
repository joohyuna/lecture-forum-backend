import { Router } from "express";
import adminCategoryController from "../../../controllers/admin/adminCategoryController.ts";
import { validate } from "../../../middlewares/validate.ts";
import { adminCreateCategorySchema } from "../../../schemas/admin/category/createCategory.ts";
import { adminUpdateCategorySchema } from "../../../schemas/admin/category/updateCategory.ts";


const router = Router();

// 생성이라는건, 프론트엔드에서 값을 받아와함으로, 검증 절차가 중간에 들어가야 함
// 검증절차 schema를 만들어야한다.
router.post("/create", validate(adminCreateCategorySchema), adminCategoryController.createCategory);
router.get("/list", adminCategoryController.getCategoryList);
router.patch("/:id/status", adminCategoryController.toggleCategoryStatus);
router.patch("/:id", validate(adminUpdateCategorySchema), adminCategoryController.updateCategory);



export default router;