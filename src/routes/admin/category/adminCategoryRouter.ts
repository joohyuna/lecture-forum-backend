import { Router } from "express";
import adminCategoryController from "../../../controllers/admin/adminCategoryController.ts";


const router = Router();

router.get("/list", adminCategoryController.getCategoryList);

export default router;