import prisma from "../../config/prisma.ts";

const getCategoryList = () => {
    // findMany(): 데이터 베이스에서 여러개의 row을 SELECT하는 메서드
    // SELECT * FROM category ORDER BY id DESC

    return prisma.category.findMany({
        orderBy: {
            id: "desc",
        },
    });
};

export default {
    getCategoryList,
};
