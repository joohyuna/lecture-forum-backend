import { Request, Response } from "express";
import postService from "../services/postService.ts";

const getPostsByCategory = async (req: Request<{ categoryId: string }>, res: Response) => {
    try {
        const categoryId = Number(req.params.categoryId);
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 20;

        if (isNaN(categoryId)) {
            res.status(400).json({
                message: "유효하지 않은 카테고리 ID입니다.",
            });
            return;
        }

        const result = await postService.getPostsByCategory(categoryId, page, size);
        res.status(200).json({
            message: "게시글 목록을 성공적으로 불러왔습니다.",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "서버 에러가 발생되었습니다.",
        });
    }
};

export default {
    getPostsByCategory,
};
