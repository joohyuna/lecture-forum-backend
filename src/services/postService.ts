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
    };
};

const getPostById = async (postId: number, userId?: number) => {
    // SELECT를 했는데 자료가 겁색이 없으면 어차피 post라는 변수엔 null
    const post = await prisma.post.findUnique({
        where: {
            id: postId,
            deletedAt: null,
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

    if (!post) {
        // 이 아래쪽으로는 진해응ㄹ 못 하도록 막기 위해, return을 쳐줌
        return null;
    }

    // 이 글의 투표에 대한 내용을 불러와야 함
    // 그럼 post에서 검색해 올때 votes를 쓰면 되지 않나? 라고 할 수 있는데
    // 이렇게 votes에 vote 테이블에 있는 정보를 덧붙이면 (JOIN하면)
    // 누가, 몇 번에 . 투표했는지 정보가 다 노출 됨
    // 우리가 필요한건 1번에 몇명, 2번에 몇명 투표했는지 만 필요하지
    // 누가 몇번에 투표했는가애 대한 정보는 필요없음

    const option1Count = await prisma.vote.count({
        where: {
            postId: postId,
            option: 1,
        },
    });
    const option2count = await prisma.vote.count({
        where: {
            postId: postId,
            option: 2,
        },
    });

    // 지금 요청을 한 이 사람이 이글에 대해 투표를 했는지 안 했는지
    let hasVoted = false;
    if (userId) {
        const myVote = await prisma.vote.findFirst({
            where: {
                userId: userId,
                postId: postId,
            },
        });
        if (myVote) {
            hasVoted = true;
        }
    }

    return {
        ...post,
        vote: {
            option1Count,
            option2count,
            totalCount: option1Count + option2count,
            hasVoted,
        },
    };
};

const createPost = async (postData: PostCreateInput) => {
    // INSERT 쿼리 전송
    await prisma.post.create({
        data: postData,
    });
};

export default {
    getPostsByCategory,
    createPost,
    getPostById,
};
