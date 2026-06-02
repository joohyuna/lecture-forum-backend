import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.ts";
import { CreateReplyInputType } from "../schemas/reply/createReplySchema.ts";
import replyService from "../services/replyService.ts";

const createReply = async (req: AuthRequest, res: Response) => {
    try {
        // userId는 req.user
        // postID는 content는 req.body
        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비6스 입니다.",
            });
            return;
        }
        const userId = req.user.id;

        const { postId, content }: CreateReplyInputType = req.body;

        const result = await replyService.createReply(userId, postId, content);
        res.status(201).json({
            message: "댓글이 성공적으로 작성되었습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND") {
                res.status(404).json({
                    message: "존재하지 않거나 삭제된 게시물입니다.",
                });
                return;
            }
        }

        console.log(error);
        res.status(500).json({
            message: "댓글 등록 중 서버 오류가 발생되었습니다.",
        });
    }
};

export default {
    createReply,
};
