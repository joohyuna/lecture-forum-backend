import { Router } from "express";
import adminUserController from "../../../controllers/admin/user/adminUserController.ts";
import { validate } from "../../../middlewares/validate.ts";
import { adminCreateUserSchema } from "../../../schemas/admin/user/createUser.ts";
import { adminUpdateUserSchema } from "../../../schemas/admin/user/updateUser.ts";

const router = Router();

// 유저 목록 조회
router.get("/list", adminUserController.getUserList);
// 유저 생성
router.post("/create", validate(adminCreateUserSchema), adminUserController.createUser);
// 유저 수정
router.patch("/:id", validate(adminUpdateUserSchema), adminUserController.updateUser);
// 유저 한명 조회
router.get("/:id", adminUserController.getUserById);
// 유저 소프트 삭제 (토글)
router.patch("/:id/delete", () => {});

export default router;
