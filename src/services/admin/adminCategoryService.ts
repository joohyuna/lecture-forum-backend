import prisma from "../../config/prisma.ts";
import { CategoryCreateInput } from "../../generated/prisma/models/Category.ts";
import { CategoryStatus, Prisma } from "../../generated/prisma/client.ts";

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
        // 생성 작업을 마친 prisma는 생성한 그 데이터를 리턴함
        return await prisma.category.create({
            data: input,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new Error("ALREADY_EXIST_CATEGORY_NAME");
            }
        }
        throw error;
    }
};

const toggleCategoryStatus = async (id: number) => {
    const exist = await prisma.category.findUnique({
        where: {
            id,
        },
    });

    if (!exist) {
        throw new Error("CATEGORY_NOT_FOUND");
    }
    const newStatus =
        exist.status === CategoryStatus.ACTIVE ? CategoryStatus.INACTIVE : CategoryStatus.ACTIVE;

    // UPDATE category SET status = newStatus WHERE id = id;
    // 업데이트 후 해당 category를 리턴
    return prisma.category.update({
        where: {
            id,
        },
        data: {
            status: newStatus,
        },
    });
};
export default {
    getCategoryList,
    createCategory,
    toggleCategoryStatus,
};
