import prisma from "../../config/prisma.ts";
import {
    CategoryCreateInput,
    CategoryUpdateInput,
} from "../../generated/prisma/models/Category.ts";
import { CategoryStatus, Prisma } from "../../generated/prisma/client.ts";

const getCategoryList = () => {
    // findMany(): 데이터 베이스에서 여러개의 row을 SELECT하는 메서드
    // SELECT * FROM category ORDER BY id DESC //내림차순

    // .findMany()의 리턴 타입은 Cagegory[] 그렇기 때문에 검색 결과가 없어도 []반환디ㅚㅁ
    return prisma.category.findMany({
        orderBy: {
            id: "desc",
        },
    });
};

const getCategoryById = async (id: number) => {
    // .findUnique()는 유일한 값을 검색하는 명령이기 때문에 값이 없을 수 있음 -> null
    const category = prisma.category.findUnique({
        where: {
            id,
        }
    });
    if (!category) {
        throw new Error("CATEGORY NOT_FOUND");
    }
    return category;
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

const updateCategory = async (id: number, input: CategoryUpdateInput) => {
    try {
        // 1. 성공 시나리오
        // return 은 정상 적인것을 던지는 것임
        return prisma.category.update({
            where: {
                id,
            },
            data: input,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Prisma의 에러 코드 P2002는 중복값이 있을 때 나오는 에러코드
            // 2. 실패 시나리오
            if (error.code === "P2002") {
                // throw 는 실패를 던지는 것
                throw new Error("ALREADY_EXIST_CATEGORY_NAME");
            }
            // Prisma이 에러코드는 P2025는 업데이 대상을 찾지 못할 때 에러코드
            // 3. 실패 시나리오
            if (error.code === "P2025") {
                throw new Error("CATEGORY_NOT_FOUND");
            }
        }
        // 4. 실패 시나리오
        throw error;
    }
};
export default {
    getCategoryList,
    getCategoryById,
    createCategory,
    toggleCategoryStatus,
    updateCategory,
};
