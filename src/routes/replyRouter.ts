import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import replyController from "../controllers/replyController.ts";
import { createReplySchema } from "../schemas/reply/createReplySchema.ts";
import { validate } from "../middlewares/validate.ts";

const router = Router();

router.get("/:postId", replyController.getRepliesByPostId);
router.post("/create", authenticate, validate(createReplySchema), replyController.createReply);

export default router;

//CRUD
// 댓글 생성 기능을 만들기 위해 프론트엔드에게 받아야 되는 정보
// userId   > 이 댓글을 남긴 사람이 누구인가
//          > 직접 받아야 될까?  (X)
//          > 이미 req.headers 에 토큰이 담겨져 있으니까
//          >>> 이러한 과정을 이미 authenticate라는 미들웨어가 함
//          >>> req.user

// postId   > 댓글이 어느 글에 남겨져야 하는가
//          > 직접 받아야 될까? (O)
//          > 어떻게 받아야 될까?  => 데이터를 받을 수 잇는 3종류
//          >>> req.params (동적라우팅)  /reply/5/create
//          >>> req.query (쿼리스트링)  /reply/create?postId=5
//          >>> req.body (바디)   /reply/create

// content  > 댓글 내용
//          > 직접 받아야 될까?     (O)
//          > 어떻게 받아야 될까?   => 엔터도 포함될 수 있고,
//                                  => 주소에 담지 못할만큼 길 수 있음
//          >>> req.body