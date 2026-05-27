import prisma from "../config/prisma.ts";

const getActiveCategories = async () => {
    // SELECT id, name FROM category WHERE status = 'ACTIVE' ORDER BY id DESC
    return prisma.category.findMany({
        where: {
            status: "ACTIVE",
        },
        orderBy: {
            id: "desc",
        },
        // 원하는 칼럼만 가져오는것
        select : {
            id: true,
            name: true,
        }
    })

};

export default {
    getActiveCategories,
};
