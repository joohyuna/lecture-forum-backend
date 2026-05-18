import { Router } from "express";
import adminCategoryRouter from "./category/adminCategoryRouter.ts";


const router= Router();

router.use("/category", adminCategoryRouter);

export default  Router();