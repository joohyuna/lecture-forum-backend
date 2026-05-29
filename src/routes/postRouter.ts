import {Router} from "express";
import postController from "../controllers/postController.ts";
import { createPostSchema } from "../schemas/post/createPostSchema.ts";
import { validate } from "../middlewares/validate.ts";
import { authenticate } from "../middlewares/auth.ts";

const router = Router();

router.get("/list/:categoryId", postController.getPostsByCategory);
router.get("/:id", postController.getPostById);
router.post("/create", authenticate, validate(createPostSchema), postController.createPost);

export default router;