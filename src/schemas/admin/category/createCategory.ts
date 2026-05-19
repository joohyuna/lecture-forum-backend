import { z } from "zod";

export const adminCreateCategorySchema = z.object({
    name: z
        .string()
        .min(1, "카테고리명을 입력해주세요")
        .max(50, "카테고리명을 최대50자를 초과할수 없습니다."),
});

export type AdminCreateCategoryInputType= z.infer<typeof adminCreateCategorySchema>;
