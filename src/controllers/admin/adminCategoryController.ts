import { Request, Response } from "express";
import adminCategoryService from "../../services/admin/adminCategoryService.ts";

const getCategoryList = async (req: Request, res: Response) => {
    try {
        const result = await adminCategoryService.getCategoryList();

        res.status(200).json({
            message: "카테고리 목록을 성공적으로 불러왔습니다.",
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "카테고리 목록 조회 중 서버 에러가 발생되었습니다." });
    }
};

export default {
    getCategoryList,
};
