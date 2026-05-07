// Model 만드는 것임
import { z } from "zod";
import { GenderType } from "../../generated/prisma/enums.ts";

// zod를 통한 검증할 Input값에 대한 객체모양 생성
export const createUserSchema = z.object({
    username: z.string().min(4),
    password: z.string().min(6),
    name: z.string().min(2),
    nickname: z.string().min(2).max(50),
    email: z.email(),
    phoneNumber: z.string().optional(),
    birthday: z.iso.datetime().optional(),
    gender: z.enum(GenderType),
});

// 위에서 만든 createUserSchema는 조건을 건 "객체"를 만드는 일이라, 앞으로 다룬 곳에서 사용할 타입음 만들어줘야함
export type CreateUserInputType = z.infer<typeof  createUserSchema>;

// 검증에 사용 할 명세를 만든것이다.
// 아직 기능에 넣지는 않았다
// 라우터에 건다