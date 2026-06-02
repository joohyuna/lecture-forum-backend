import prisma from "../config/prisma.ts";

const getRepliesByPostId = async (postId: number, page: number, size: number) => {
    // 목록을 불러오는 목적의 service니까
    // pagination도 해야되는 구나 => skip, take를 써야함
    const skip = (page - 1) * size;

    const total = await prisma.reply.count({
        where: { postId },
    });

    const list = await prisma.reply.findMany({
        where: {
            postId,
        },
        take: size,
        skip,
        orderBy: { id: "desc" }, // 가장 최근 이것은 선택 내림차순
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                },
            },
        },
    });

    return {
        page,
        size,
        total,
        list,
    };
};

const createReply = async (userId: number, postId: number, content: string) => {
    // 이 댓글에
    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            deletedAt: null,
        },
    });

    if (!post) {
        throw new Error("NOT_FOUND");
    }

    return prisma.reply.create({
        data: {
            userId,
            postId,
            content,
        },
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                },
            },
        },
    });
};

export default {
    getRepliesByPostId,
    createReply,
};
