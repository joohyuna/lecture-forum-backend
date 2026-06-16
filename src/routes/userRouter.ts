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

//이 토큰이 정상적인지 확인을 하기 위한 요청이 들어오면,
// 1. 해당 토근의 정보가 옳은지
// 2. 이 사용자가 정상 사용자인지 => 서비스 쪽에서 user 테이블에서 정보를 잃어들임
//                                => 요청을 한 사용자 정보를 뱉어주는 API를 만들면 되겠다.
// 미들웨어로 끝나면 안됀다 next() 때문에
router.get("/me", authenticate, userController.getMe);

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
