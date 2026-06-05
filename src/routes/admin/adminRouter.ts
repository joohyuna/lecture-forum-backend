import { Router } from "express";
import adminCategoryRouter from "./category/adminCategoryRouter.ts";
import adminUserRouter from "./user/adminUserRouter.ts";
import { authenticate, requiredAdmin } from "../../middlewares/auth.ts";
import adminNoticeRouter from "./notice/adminNoticeRouter.ts";


// /admin으로 들어오는 모든 Request
const router = Router();

// 로그인 하고 authenticate 토근 인증으로 회원확인
// 그후 requiredAdmin 로 관리자 인지 확인 접근 권한 넣기
router.use(authenticate);
router.use(requiredAdmin);

router.use("/category", adminCategoryRouter);
router.use("/user", adminUserRouter);
router.use("/notice", adminNoticeRouter);

export default router;
