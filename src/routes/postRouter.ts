import {Router} from "express";
import postController from "../controllers/postController.ts";

const router = Router();

router.get("/list/:category", postController.getPostsByCategory);

export default router;