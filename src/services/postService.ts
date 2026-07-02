import prisma from "../config/prisma.ts";
import { PostCreateInput } from "../generated/prisma/models/Post.ts";

const getRecentPosts = async () => {
    return prisma.post.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            id: "desc",
        },
        take: 8, // 원래는 20
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

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
    const option2Count = await prisma.vote.count({
        where: {
            postId: postId,
            option: 2,
        },
    });

    // 지금 요청을 한 이 사람이 이글에 대해 투표를 했는지 안 했는지
    // 변수를 선언할 때 사용할 수 있는 키워드
    // var  => x   : 사용하지 말아야 할 이유 (내가 쓰기 전에: 즉, 그 안에 무언가 값을 저장하기 전 : 도 변수에 접근할 수 있기 때문)
    // 개발자가 통제하기 전에 접근이 가능하도록 열려있어서 사용하지 말라고
    // let
    // const => 이것로만 선언
    // let / const
    // let은 값을 변경할 수 있는 변수를 만드는 키워드 => let으로 값을 저장해도, 지속적으로 값을 변경할 수 있음
    // let a;
    // a = 10;
    // const는 값을 변경할 수 없는 변수를 만드는 키워드 => const는 선언할 때 넣은 값을 바꿀 수 없음
    // const a;  (a의 값을 변경 할 수 없게 잠김 => 사용 할 수 없는 상태라 이렇게 할 수 없음)
    // const a = 10; 할당이 동시에 이뤄져야함 함

    // 근데 왜 대부분 const를 쓰게 되지?
    // 우리가 거의 대부분의 변수에는 원시타입을 집어넣기볻, array 또는 Object를 넣기 때문
    // array 또는 Object는 메모리 상 값이 "우리가 생각하는 값"이 저장되니 않고, 주소값이 저장됨 <= 얘만 못 바꾼다는 뜻
    // [1, 2, 3, 4, 5]  => 1, 2, 3, 4, 5라는 값이 저장되는 공간 // 주소값이 저장되는 공간
    // const a = true;
    // a = false; (X)
    // const b = [];
    // b.push(3);  (O)  => 원래의 array에, 연결된 공간에 3값을 쓰기 때문에 가능
    // b = { id: 3 }; (X) => 새로운 객체의 주소값을 b에 넣으려고 하기 때문에 안됨
    // b = [8]  (X) => 새로운 array의 주소값을 b에 넣으려고 하기 때문에 안됨

    // 프로그램을 할 때 기본적으로 const를 사용하는거소, 그리고 값이 변경된다고 판단될 때 let으로 변경

    // var는 중복선언가능
    // let/const 중복선언 불가능

    // var와 let/const는 스코프 차이가 있음
    // var는 구분짓는 스코프가 함수 스코프에 대해서만 영얗을 받음
    // let/const는 함수 스코프 뿐만 아니라 블록 스코프에 대해서도 영향을 받음

    // 지금 요청을 한 이 사람이 이 글에 대해 투표를 했는지 안 했는지
    // 자식들은 부모의 것을 선택할수 있어서 안에서 사용하려면
    let hasVoted = false; // 나중에 보니 값을 바꿀수 있어야 해서 let 필요해서 의해서 기본적으로 const 사용
    if (userId) {
        // findFirst는 조건에 맞는 첫 번째 데이터를 찾음
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

    // 선생님이 만들어준 코드
    await prisma.post.update({
        where: {
            id: postId,
        },
        data: {
            views: post.views + 1,
        },
    });

    // 이렇게 작성하면, getPostById 서비스가 불러와질 때마다 다른 조건 없이 조회수가 1씩 올라감
    // 만약, A 사용자가 이 글을 당일에 조회수 1번만 올려지도록 할거라면 어떻게 해결해야할까?

    // 스프레드 문법
    return {
        ...post,
        views: post.views + 1,
        vote: {
            option1Count,
            option2Count,
            totalCount: option1Count + option2Count,
            hasVoted,
        },
    };
};

const createPost = async (postData: PostCreateInput) => {
    // INSERT 쿼리 전송
    return prisma.post.create({
        data: postData,
    });
};

const votePost = async (postId: number, userId: number, option: number) => {
    // 1. postId의 글이 존재 유뮤 (소프트삭제로 고려)
    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            deletedAt: null,
        },
    });
    if (!post) {
        throw new Error("NOT_FOUND");
    }

    // 2. option1Text와 option2Text가 있는 체크
    if (!post.option1Text || !post.option2Text) {
        throw new Error("NOT_VOTABLE");
    }

    // 3. 이사용자가 투표를 이미 진행했는지 체크
    const existingVote = await prisma.vote.findUnique({
        where: {
            userId_postId: { userId, postId },
        },
    });
    if (existingVote) {
        throw new Error("ALREADY_VOTED");
    }

    return prisma.vote.create({
        data: {
            userId,
            postId,
            option,
        },
    });
};

const cancelVotePost = async (postId: number, userId: number) => {
    // service는 에러를 어디에 처리핤지를 내가 결정해서
    // try - catch를 선택적으로 사용 가능
    const existVote = await prisma.vote.findUnique({
        where: {
            userId_postId: { userId, postId },
        },
    });
    if (!existVote) {
        throw new Error("NOT_VOTED");
    }

    // 실제 삭제가 이루어져야 함
    // delete 내가 얘를 삭제했어 삭제된 vote 객체를
    await prisma.vote.delete({
        where: {
            userId_postId: { userId, postId },
        },
    });
    return;

    // const result = await prisma.vote.create({ date: {}})   => 그렇게 생성된 vote 객체 (후결과)
    // const result = await prisma.vote.update({ where: {}, data: {} }) => 그렇게 업데이트됨  vote 객체 (후결과)
    // const result = await prisma.vote.findFirst({ where: {} })  => 그렇게 검색한 vote 객체 => 없으면 null
    // const result = await prisma.vote.findUnique({ where: {} })  => 그렇게 검색한 vote 객체 => 없으면 null
    // const result = await prisma.vote.findMany({ where: {}})  => 그렇게 검색한 vote Array => 없으면 []
    // const result = await prisma.vote.delete({ where: {} }) => 그렇게 삭제된 vote  객체 (전내용)
};

export default {
    getRecentPosts,
    getPostsByCategory,
    createPost,
    getPostById,
    votePost,
    cancelVotePost,
};
