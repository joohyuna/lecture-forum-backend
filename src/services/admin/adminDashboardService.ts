import prisma from "../../config/prisma.ts";

const geDashboardSummary = async () => {
    // async - await 을 톨해 진행하게 되면
    // await 이 붙은 비동기 함수가 실행이 끝나고 결과가 도출 될 때 까지 기다리겠다라는 의미이므로
    // 총 0.5씩 걸리는 await 비동기 함수 3개를 실행하면
    // 총 1.5초 걸림 -> 비효율적임

    // "비동기 함수들 "을 묶어서 처리하는 방법이 존재함 => 병렬처리
    // 동시에 싫행한다.
    const [users, posts, inquiries] = await Promise.all([
        prisma.user.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
        }),
        prisma.post.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        email: true,
                    },
                },
            },
        }),
        prisma.inquiry.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        email: true,
                    },
                },
            },
        }),
    ]);
    // 첫번째 0.3
    // 두번째 0.9
    // 세번째 0.5
    // 총 걸린시간 0.9

    // const users = await prisma.user.findMany({
    //     where: {
    //         deletedAt: null,
    //     },
    //     orderBy: {
    //         createdAt: "desc",
    //     },
    //     take: 5,
    // });
    //
    // const posts = await prisma.post.findMany({
    //     where: {
    //         deletedAt: null,
    //     },
    //     orderBy: {
    //         createdAt: "desc",
    //     },
    //     take: 5,
    //     include: {
    //         user: {
    //             select: {
    //                 id: true,
    //                 nickname: true,
    //                 email: true,
    //             },
    //         },
    //     },
    // });
    //
    // const inquiries = await prisma.inquiry.findMany({
    //     orderBy: {
    //         createdAt: "desc",
    //     },
    //     take: 5,
    //     include: {
    //         user: {
    //             select: {
    //                 id: true,
    //                 nickname: true,
    //                 email: true,
    //             },
    //         },
    //     },
    // });

    return {
        users,
        posts,
        inquiries,
    };
};

export default {
    geDashboardSummary,
};
