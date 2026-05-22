import prisma from "../../../config/prisma.ts";
import { UserCreateInput, UserUpdateInput } from "../../../generated/prisma/models/User.ts";
import { Prisma } from "../../../generated/prisma/client.ts";

// 유저 목록 API
const getUserList = async () => {
    return prisma.user.findMany({
        orderBy: {
            id: "desc",
        },
    });
};

// 한개의 유저 API
// 문제 (error) 가 생기면,
// 내 안에 있는 try - catch를 찾고
// 내 안에 try - catch가 없다면, 상위 존재의 try - catch를 찾는다.
const getUserById = async (id: number) => {
    const user = prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return user;
};

const createUser = async (input: UserCreateInput) => {
    try {
        return prisma.user.create({
            data: input,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const errorMessage = error.message;

                if (errorMessage.includes("username")) {
                    throw new Error("ALREADY_EXISTS_USERNAME");
                }
                if (errorMessage.includes("email")) {
                    throw new Error("ALREADY_EXISTS_EMAIL");
                }
                if (errorMessage.includes("nickname")) {
                    throw new Error("ALREADY_EXISTS_NICKNAME");
                }
            }
        }

        throw new Error("UNKNOWN_ERROR");
    }
};

const updateUser = async (input: UserUpdateInput, id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    try {
        return prisma.user.update({
            where: {
                id,
            },
            data: input,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const errorMessage = error.message;
                if (errorMessage.includes("username")) {
                    throw new Error("ALREADY_EXISTS_USERNAME");
                }
                if (errorMessage.includes("email")) {
                    throw new Error("ALREADY_EXISTS_EMAIL");
                }
                if (errorMessage.includes("nickname")) {
                    throw new Error("ALREADY_EXISTS_NICKNAME");
                }
            }
        }
        throw new Error("UNKNOWN_ERROR");
    }
};

const toggleUser = async (id: number) => {
    // 실제 데이터베이스에 DELETE로 요청하는게 아닌,
    // UPDATE로 deletedAt만 날짜를 기록할 것임 (소프트 삭제)
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    // 3.
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    // 2.
    if (user.deletedAt) {
        throw new Error("USER_ALREADY_DELETED");
    }

    // 1.
    return prisma.user.update({
        where: {
            id,
        }, data: {
            deletedAt: new Date(),
        }
    })
};

export default {
    getUserList,
    getUserById,
    createUser,
    updateUser,
    toggleUser,
};
