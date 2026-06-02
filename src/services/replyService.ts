import prisma from "../config/prisma.ts";

const createReply = async (userId: number, postId: number, content: string) => {
    // dl eot
    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            deletedAt: null,
        }
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
                }
            }
        }
    })
};

export default {
    createReply,
};
