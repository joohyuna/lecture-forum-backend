import { Request, Response } from "express";
import adminCategoryService from "../../services/admin/adminCategoryService.ts";
import { CategoryCreateInput } from "../../generated/prisma/models/Category.ts";
import { AdminCreateCategoryInputType } from "../../schemas/admin/category/createCategory.ts";
import { CategoryStatus } from "../../generated/prisma/enums.ts";

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
        // AdminCreateCategoryInputType은 "들어오는 입력값"에 대한 타입
        // CategoryCreateInput은 "데이터베이스에 저장할 데이터"의 타입
        const { name }: AdminCreateCategoryInputType = req.body;
        const newCategory: CategoryCreateInput = { name };

        const result = await adminCategoryService.createCategory(newCategory);

        res.status(201).json({
            message: "카테고리가 성공적으로 생성되었습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ALREADY_EXIST_CATEGORY_NAME") {
                res.status(409).json({ message: "이미 존재하는 카테고리 이름입니다." });
                return;
            }
        }
        console.log(error);
        res.status(500).json({
            message: "카테고리 생성 중 서버 에러가 발생했습니다.",
        });
    }
};

const toggleCategoryStatus = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                message: "유효하지 않은 카테고리 ID입니다.",
            });
            return;
        }

        const result = await adminCategoryService.toggleCategoryStatus(id);

        res.status(200).json({
            message: `카테고리가 ${result.status === CategoryStatus.ACTIVE ? "활성화" : "비활성화"} 되었습니다.`,
            data: result,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
            res.status(400).json({ message: "카테고리를 찾을수 없습니다." });
            return;
        }
        console.log(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    getCategoryList,
    createCategory,
    toggleCategoryStatus,
};
