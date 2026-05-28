import {Router} from "express";
import postController from "../controllers/postController.ts";

const router = Router();

router.get("/list/:categoryId", postController.getPostsByCategory);

export default router;