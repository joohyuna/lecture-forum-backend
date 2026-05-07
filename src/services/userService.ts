import { UserCreateInput } from "../generated/prisma/models/User.ts";
import prisma from "../config/prisma.ts";

const createUser = async (data: UserCreateInput) => {
    // 컨트콜러에서 만들어진 newUser를 받아서, prisma를 통해 DB에 저장
    // prisma.태이블.create(객체) : INSERT하는 메서드 => 리턴 값이 생성된 User객체 반환
    // 프리즈마는 DB와 통신하는 ORM임으로 당연 비동기 함수 => async - await

    // create를 생성하면 User 객체가 반환되는데, 그걸 바로 return 시킬거면
    // await 키워드를 생략함 대신 async는 빼면 안됨
    return prisma.user.create({
        data,
        // 실제 입력하는 칼럼 내용들을 적으면 됨
        // 그러나 ...스레드 방식으로
        // key와 변수명이 같다 그래서 그냥 data만 씀
    });
};

export default {
    createUser,
};
