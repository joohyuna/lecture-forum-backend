import { Request, Response } from "express";
import adminCategoryService from "../../services/admin/adminCategoryService.ts";
import { CategoryCreateInput } from "../../generated/prisma/models/Category.ts";
import { AdminCreateCategoryInputType } from "../../schemas/admin/category/createCategory.ts";

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

const createCategory = async (req: Request, res: Response) => {
    try {
        // AdminCreateCategoryInputType은 "들어오는 입력값에"대한 타입
        // CategoryCreateInput은 "데이터베이스에 저장할 데이터"의 타입
        const { name }: AdminCreateCategoryInputType =  req.body;
        const newCategory: CategoryCreateInput = { name }

        const result = await adminCategoryService.createCategory(newCategory);

        res.status(200).json({
            message: "카테고리가 성공적으로 생성되었습니다.",
            data: result,
        })
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ALREADY_EXIST_CATEGORY_NAME") {
                res.status(409).json({ message: "이미 존재하는 카테고리 이름입니다." });
                return;
            }
        }
        console.log(error);
        res.status(409).json({
            message: "카테고리 생성 중 서버에러가 발생했습니다."
        });
    }

}

export default {
    getCategoryList,
    createCategory,
};
