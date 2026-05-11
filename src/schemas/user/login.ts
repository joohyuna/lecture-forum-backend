import { z } from "zod";


// 검증할 항목
export const loginSchema = z.object({
    username: z.string().min(1, "아이디를 입력해주세요"),
    password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type LoginInputType = z.infer<typeof loginSchema>;