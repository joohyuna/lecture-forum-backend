import { Router } from "express";
import adminCategoryRouter from "./category/adminCategoryRouter.ts";
import adminUserRouter from "./user/adminUserRouter.ts";


const router= Router();

router.use("/category", adminCategoryRouter);
router.use("/user", adminUserRouter);

export default router;