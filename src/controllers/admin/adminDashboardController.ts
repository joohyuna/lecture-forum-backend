import { Request, Response } from "express";
import adminDashboardService from "../../services/admin/adminDashboardService.ts";

const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        const result = await adminDashboardService.getDashboardSummary();
        res.status(200).json({
            message: "관리자 대시보드 요약 데이터를 성공적으로 불러왔습니다.",
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "관리자 대시보드 요약 데이터를 불러오는 중에 오류가 발생했습니다.",
        });
    }
};

export default {
    getDashboardSummary,
};
