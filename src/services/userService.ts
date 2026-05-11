import { UserCreateInput } from "../generated/prisma/models/User.ts";
import prisma from "../config/prisma.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { LoginInputType } from "../schemas/user/login.ts";
import passwordUtil from "../utils/password/passwordUtil.ts";
import jwtUtil from "../utils/jwt/jwtUtil.ts";

const createUser = async (data: UserCreateInput) => {
    try {
        // 컨트콜러에서 만들어진 newUser를 받아서, prisma를 통해 DB에 저장
        // prisma.태이블.create(객체) : INSERT하는 메서드 => 리턴 값이 생성된 User객체 반환
        // 프리즈마는 DB와 통신하는 ORM임으로 당연 비동기 함수 => async - await

        // create를 생성하면 User 객체가 반환되는데, 그걸 바로 return 시킬거면
        // await 키워드를 생략함 대신 async는 빼면 안됨
        // try catch 를 사용하려면 다시 await
        return await prisma.user.create({
            data,
            // 실제 입력하는 칼럼 내용들을 적으면 됨
            // 그러나 ...스프레드 방식으로
            // key와 변수명이 같다 그래서 그냥 data만 씀
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Prisma error 객체 내부에 code 함목 값이 "P2002"인 것이
            // 중복값이 있을 때의 에러코드임
            if (error.code === "P2002") {
                // 중복된 칼럼에 어떤 것인지에 대한 정보는
                // error.meta?.target에 들어 있는데 이 프로퍼티 타입은 string[] | undefined
                // Prisma 에 지정된것임
                const errorMessage = error.message;

                // 예시 target = ["username", "nickname", "email"]
                // array의 요소중 "이 값"이 있는지 확인하는 메소드는 .includes()
                // .find()와 비슷한 역할이지만,
                // find는 조건을 걸어서 찾을 수 잇는 메서드이고
                // includes는 단순히 집어넣은 값과 완벽히 같은 것이 있는지 true/false로 찾음
                if (errorMessage.includes("username")) {
                    // 상위 함수로 던지는데,
                    // 새로운 자바스크립트 표준 객체를 만들어서 던짐.
                    // 그 내용은 ALREADY_EXISTS_USERNAME이라고 담아서 .
                    throw new Error("ALREADY_EXISTS_USERNAME");
                }
                if (errorMessage.includes("email")) {
                    throw new Error("ALREADY_EXISTS_EMAIL");
                }
                if (errorMessage.includes("nickname")) {
                    throw new Error("ALREADY_EXISTS_NICKNAME");
                }
                throw new Error("UNKNOWN_ERROR");
            }
        }
        throw new Error("UNKNOWN_ERROR"); // return과 같은데 값을 리턴하는게 아니라 에러를 리턴하는 키워드
    }
};

const login = async (data: LoginInputType) => {
    // prisma.테이블.findUnique() : SELECT 명령 (단, Unique 칼럼을 통해)
    // findUnique라는  메서드는 객체1개만 리턴
    // find라는 메서는 Array 가 리턴

    const user = await prisma.user.findUnique({
        // prisma.c
        where: {
            username: data.username,
        },
    });
    // 검색 했는데 해당하는 내용이 없는것, 에러가 아님
    // DB에서 조회하 내용인 user가 없거나 deletedAt의 있으면
    // 탈퇴 되었음을 기록해놓는것이 deletedAt
    if (!user || user.deletedAt) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const isValid = await passwordUtil.verifyPassword(data.password, user.password);
    if (!isValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // 아이디와 비밀번호가 일치하는 정보가 있다는 뜻
    // 로그인 해줘야 함
    const token = jwtUtil.generateToken(user.id);

    // password와 deletedAt라는 항목은 response(응답)에 포함시킬 필요 없어서, 그걸 제회한 나머지만 safeUserInfo에 저장
    const { password, deletedAt, ...safeUserInfo } = user;
    return {
        user: safeUserInfo,
        token,
    };

    // createUser에서는 에러가 나는 부분에 에러 객체가 Prisma Error 객체 였기 때문에 service에서 Javascript Error 겍체로 바꿔즐
    // 필요가 있엇ㅈ만,
    // login에서는 필요가 없다.
}

export default {
    createUser,
    login,
};
