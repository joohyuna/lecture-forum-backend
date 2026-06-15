import { UserCreateInput } from "../generated/prisma/models/User.ts";
import prisma from "../config/prisma.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { LoginInputType } from "../schemas/user/login.ts";
import passwordUtil from "../utils/password/passwordUtil.ts";
import jwtUtil from "../utils/jwt/jwtUtil.ts";
import { UpdateUserInputType } from "../schemas/user/updateUserSchema.ts";
import { UpdatePasswordInputType } from "../schemas/user/updatePasswordSchema.ts";

const createUser = async (data: UserCreateInput) => {
    try {
        // 컨트콜러에서 만들어진 newUser를 받아서, prisma를 통해 DB에 저장
        // prisma.태이블.create(객체) : INSERT하는 메서드 => 리턴 값이 생성된 User객체 반환
        // 프리즈마는 DB와 통신하는 ORM임으로 당연 비동기 함수 => async - await

        // create를 생성하면 User 객체가 반환되는데, 그걸 바로 return 시킬거면
        // return 바로 할꺼면 await 키워드를 생략함 (이것은 특이점임) 대신 async는 빼면 안됨
        // try catch 를 사용하려면 다시 await
        return await prisma.user.create({
            data,
            // 실제 입력하는 칼럼 내용들을 적으면 됨
            // 그러나 ...스프레드 방식으로
            // key와 변수명이 같다 그래서 그냥 data만 씀
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Prisma error 객체 내부에 code 항목 값이 "P2002"인 것이
            // 중복값이 있을 때의 에러코드임
            if (error.code === "P2002") {
                // 중복된 칼럼에 어떤 것인지에 대한 정보는
                // error.meta?.target에 들어 있는데 이 프로퍼티 타입은 string[] | undefined
                // Prisma 에 지정된것임
                const errorMessage = error.message;

                // 예시 target = ["username", "nickname", "email"]
                // array의 요소중 "이 값"이 있는지 확인하는 메소드는 .includes()
                // .find()와 비슷한 역할이지만,
                // find는 조건을 걸어서 찾을 수 있는 메서드이고
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

// Prisma를 사용해서 토큰 안의 내용을 사용자와  DB와의 통신으로 확인
const getUserById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    return user;
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
    // 필요가 있었지만
    // login에서는 필요가 없다.
};

const updateUser = async (userId: number, input: UpdateUserInputType) => {
    const existUser = await prisma.user.findUnique({
        where: {
            id: userId,
            deletedAt: null,
        },
    });
    // SELECT * FROM user WHERE id = userId AND deletedAt IS NOT NULL;
    if (!existUser || existUser.deletedAt) {
        throw new Error("NOT_FOUND_USER");
    }

    // nickname에 unique : 중복값이 허용되 않음

    // nickname, email, phoneNumber
    const existNickname = await prisma.user.findFirst({
        where: {
            nickname: input.nickname,
            deletedAt: null,
            id: {
                not: userId,
            },
        },
    });

    if (existNickname) {
        throw new Error("DUPLICATED_NICKNAME");
    }

    // email에 unique
    const existEmail = await prisma.user.findFirst({
        where: {
            email: input.email,
            deletedAt: null,
            id: {
                not: userId,
            },
        },
    });

    if (existEmail) {
        throw new Error("DUPLICATED_EMAIL");
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            email: input.email,
            nickname: input.nickname,
            phoneNumber: input.phoneNumber ?? null, // 데이터베이스는 항목이 존재하면 무조건 써줘야함
        },
    });
};

const updatePassword = async (userId: number, prevPw: string, pw: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("NOT_FOUND_USER");
    }

    // prevPw 사용자가 입력한 비밀번호는 평문
    // user.password는 암호문
    const isPasswordValid = await passwordUtil.verifyPassword(prevPw, user.password);
    if (!isPasswordValid) {
        throw new Error("INVALID_PASSWORD");
    }

    const hashedPassword = await passwordUtil.hashPassword(pw);

    // "지금 현재 비밀번호와 변경하려는 비밀번호가 같습니다. " 라는 에러로 팅겨 내려면
    // if (hashedPassword === user.password) {
    //     throw new Error("SAME_PASSWORD");
    // }

    // "6개월 전에 변경된 비밀번호입니다."라는 에러로 튕겨 내려면
    // 비밀번호 히스포니를 저장하고 있는 테이블을 따로 마련해야함
    // 그 비밀먼호 히스토리를 모두 findMany로 가져온되
    // for문을 돌려서 비교, 그후 시간과 함께 에러 리턴
    // 구글이 이 방식인데 이렇게 해도 문제가 되지 않는 이유는
    // 갖고 있는 비밀번호들이 전부 다 암호화 되어 있어서 구글도 실제 비밀번호가 뭔지는 모르기 때문

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password: hashedPassword,
        },
    });
};

const withdrawUser = async (userId: number, password: string) => {
    // 사용자가 존재하는지 찾고
    // 데이터베이스에는 SELECT구문 - findFirst, findUnique, findMany
    // findUnique는 where절에 들어갈 수 있는게 unique칼러에 대해서만이기에 무조건 1개 or 0개
    // findFirst는 where절에 들어가는게 제한 없이, 여러게의 칼럼이 선택되고,
    const existUser = await prisma.user.findFirst({
        where: {
            id: userId,
            deletedAt: null,
        },
    });
    if (!existUser) {
        throw new Error("NOT_FOUND_USER");
    }

    // 지금 들어온 비밀번호가 DB 상 사용자가 비밀번호와 같은지 passwordUtil확인
    const isPasswordValid = await passwordUtil.verifyPassword(password, existUser.password);
    if (!isPasswordValid) {
        throw new Error("INVALID_PASSWORD");
    }
    // 사용자 정보에 deletedAt  현재시간으로 update
    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};

export default {
    createUser,
    getUserById,
    login,
    updateUser,
    updatePassword,
    withdrawUser,
};
