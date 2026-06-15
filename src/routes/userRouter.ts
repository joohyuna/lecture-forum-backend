import { Router } from "express";
import userController from "../controllers/userController.ts";
import { validate } from "../middlewares/validate.ts";
import { createUserSchema } from "../schemas/user/createUser.ts";
import { loginSchema } from "../schemas/user/login.ts";
import { authenticate } from "../middlewares/auth.ts";
import { updateUserSchema } from "../schemas/user/updateUserSchema.ts";
import { updatePasswordSchema } from "../schemas/user/updatePasswordSchema.ts";
import { withdrawUserSchema } from "../schemas/user/withdrawUserSchema.ts";

const router = Router();

// /user/create 라고 post방식 요청이 도착하면 이 아래줄에 실행
// /user/login
router.post("/create", validate(createUserSchema), userController.createUser);
router.post("/login", validate(loginSchema), userController.login);
router.patch("/update", authenticate, validate(updateUserSchema), userController.updateUser);
router.patch(
    "/password",
    authenticate,
    validate(updatePasswordSchema),
    userController.updatePassword,
);

// 회원 탈퇴 => 실제 데이터베이스에서 그데이터르 삭제하지 않을것임
//              소프트삭제를 통해 deletedAt로 탈퇴시간
//              patch로 진행 delete
router.patch(
    "/withdraw",
    authenticate,
    validate(withdrawUserSchema),
    userController.updatePassword,
);

export default router;
