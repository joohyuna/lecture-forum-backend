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
    // 이 댓글에 달릴 글이 살아있는 글인가를 체크를 먼저 함
    // 그러면 왜 userId 살아있는 사용자는 체크 안하나요?
    // 왜냐하며, authenticate 미들웨어가 이미 사용자는 살아 있는지 체크를 했기 때문
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
            // 여기데이터는 reply의 내용만 들어오는 것이다.
            userId,
            postId,
            content,
        },
        include: {
            // include 포함시켜라
            // 필요한것만 선택 해서 가져온다 nickname가 필요하니깐
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

const deleteReply = async (id: number, postId: number) => {
    const reply = await prisma.reply.findUnique({
        where: {
            id
        }
    })
    if (!reply) {
        throw new Error("NOT_FOUND_REPLY");
    }
    if (reply.userId !== postId) {
        throw new Error("FORBIDDEN");
    }

    return prisma.reply.delete({
        where: {
            id
        }
    })
}

export default {
    getRepliesByPostId,
    createReply,
    deleteReply,
};
