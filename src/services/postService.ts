import prisma from "../config/prisma.ts";
import { PostCreateInput } from "../generated/prisma/models/Post.ts";

const getPostsByCategory = async (categoryId: number, page: number, size: number) => {
    const skip = (page - 1) * size;

    // SELECT * FROM post WHERE categoryId = categoryId AND deleteAt = Null By id DESC
    const list = await prisma.post.findMany({
        where: {
            categoryId,
            deletedAt: null,
        },
        orderBy: {
            id: "desc",
        },
        skip,
        take: size,
        include: {
            // user: true, =>  연관된 user 테이블의 정보를 싹 긇어옮
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                },
            },
        },
    });
    const total = await prisma.post.count({
        where: {
            categoryId,
            deletedAt: null,
        },
    });
    return {
        page,
        size,
        total,
        list,
    }
};

const createPost = async (postData: PostCreateInput) => {
    // INSERT 쿼리 전송
    await prisma.post.create({
    data: postData,
    })
}

export default {
    getPostsByCategory,
    createPost,
};
