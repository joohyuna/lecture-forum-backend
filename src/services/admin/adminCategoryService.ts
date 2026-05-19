import prisma from "../../config/prisma.ts";
import { CategoryCreateInput } from "../../generated/prisma/models/Category.ts";
import { Prisma } from "../../generated/prisma/client.ts";

const getCategoryList = () => {
    // findMany(): 데이터 베이스에서 여러개의 row을 SELECT하는 메서드
    // SELECT * FROM category ORDER BY id DESC //내림차순

    return prisma.category.findMany({
        orderBy: {
            id: "desc",
        },
    });
};

const createCategory = async (input: CategoryCreateInput) => {
    try {
        return await prisma.category.create({
            data: input,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "p2002") {
                throw new Error("ALREADY_EXIST_CATEGORY_NAME");
            }
        }
        throw error;
    }
}

export default {
    getCategoryList,
    createCategory
};
