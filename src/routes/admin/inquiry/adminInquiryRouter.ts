import { Router } from "express";
import adminInquiryController from "../../../controllers/admin/adminInquiryController.ts";
import { validate } from "../../../middlewares/validate.ts";
import { inquiryAnswerSchema } from "../../../schemas/inquiry/inquiryAnswerSchema.ts";

// 관리자 측에서 사용 가능한 API / admin으로 시작되는 주소로 요청이 들어오면 관리자인가(req.user)는 authenticate 미들웨어에서 탐지
// 목록 조회 => 모든 글에 대한 목록 조회 => req.params (필수값) X => req.query (선택값) page, size
// 글 상세 조회 => 모든 글에 대한 상세 조회  => req.params(필수값) 글번호(inquiryId) / req.query(선택값)X
// 이미 있는 글에 대해서
// 답변 등록 => update => req.params (필수값) 글번호(inquiryId) / req.body.answer
// 답변수정 => update => req.params (필수값) 글번호(inquiryId) / req.body.answer 없에고 등록과 같이
// 답변삭제 => update  (Null) => req.params (필수값) 글번호(inquiryId)  서비스는 삭제하고 리펙트링

const router = Router();

router.get("/list", adminInquiryController.getInquiryList);
router.get("/:inquiryId", adminInquiryController.getInquiryById);
// 답변 등록 : post여도 되고, .patch 해도 됨
// 주소를/admin/inquiry/글번호 할경욱 -> post
// 주소를/admin/inquiry/글번호/create 할 경우 -> patch
// 처음 설계할 때에는 "수정"을 만들기 생각했는데 다시글 따져보니 이 API를 생성과 수정이 같이 이용하게 되어서
// post 방식이 아닌 patch 로 변경
router.patch("/:inquiryId", validate(inquiryAnswerSchema), adminInquiryController.answerInquiry);

// 답변 수정 : patch
// 주소를/admin/inquiry/글번호 -> patch
// 주소를/admin/inquiry/글번호 /update -> patch
// 따로 만들필요가 없다 등록과 똑같다 하는 일이

// 답변 삭제 : patch, delete로 해도 됨
// 주소를/admin/inquiry/글번호 -> delete
// 주소를/admin/inquiry/글번호/delete -> patch
router.delete("/:inquiryId", adminInquiryController.deleteInquiry);

export default router;
