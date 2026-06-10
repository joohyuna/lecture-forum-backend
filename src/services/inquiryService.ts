import prisma from "../config/prisma.ts";

const getInquiryList = async (page: number, size: number, userId?: number) => {
    const skip = (page - 1) * size;

    // prisma에서 where이나 다른 절들의 조건을 걸때 그 안에 항목에
    const whereCondition = userId ? { userId } : {};
    const total = await prisma.inquiry.count({
        where: whereCondition,
    });

    const list = await prisma.inquiry.findMany({
        orderBy: { id: "desc" },
        where: whereCondition,
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                },
            },
        },
        skip,
        take: size,
    });

    return {
        page,
        size,
        total,
        list,
    };
};

const getInquiryById = async (inquiryId: number) => {
    const inquiry = await prisma.inquiry.findUnique({
        where: {
            id: inquiryId,
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
    if (!inquiry) {
        throw new Error("NOT_FOUND_INQUIRY");
    }
    return inquiry;
};

const createInquiry = async (title: string, content: string, userId: number) => {
    return prisma.inquiry.create({
        data: {
            title,
            content,
            userId,
        },
    });
};

const answerInquiry = async (inquiryId: number, answer?: string) => {
    // 답변 글을 달려면, 당연히 그 대상의 글이 존재하는지 여부를 따져줘야 함
    await getInquiryById(inquiryId);

    return prisma.inquiry.update({
        where: {
            id: inquiryId,
        },
        data: {
            answer: answer ? answer : null,
            answeredAt: answer ? new Date() : null,
        },
    });
};

// 중복이 되기 때문에 answerInquiry 와 합쳤음
// const deleteInquiry = async (inquiryId: number) => {
//     // 글이 있는 확인
//     // 이 아래에 있는 내용을 throw 가 있기 때문에 controller에서 catch 를 확인
//     await getInquiryById(inquiryId);
//
//     // update를 통해
//     return prisma.inquiry.update({
//         where: {
//             id: inquiryId,
//         },
//         data: {
//             // 글을 null로 채워줘야 한다.
//             // javascript/ typescript/java : null "값이 없음" > 메모리가 진짜 텅빈 상태
//             // 데이터베이스에서는 : null 이라는 데이터가 없는 상태의 값을 넣어줌
//             answer: null,
//             answeredAt: null,
//         },
//     });
// };

const updateInquiry = async (inquiryId: number, title: string, content: string, userId: number) => {
    // 업데이트 하기 전 게시물이 있는지 체크
    const inquiry = await getInquiryById(inquiryId);

    // 이게시물리 이사람 꺼닞 확인
    if (inquiry.userId !== userId) {
        throw new Error("NOT_YOUR_INQUIRY");
    }

    // 관리자가 한 답변이 있으면 처리 불가
    if (inquiry.answer) {
        throw new Error("ALREADY_ANSWERED");
    }
    // 업데이트
    return prisma.inquiry.update({
        where: {
            id: inquiryId,
        },
        data: {
            title,
            content,
        },
    });
};

// 최소한으로
const deleteInquiry = async (inquiryId: number) => {
    return prisma.inquiry.delete({
        where: {
            id: inquiryId,
        },
    });
};

export default {
    getInquiryList,
    getInquiryById,
    createInquiry,
    answerInquiry,
    updateInquiry,
    deleteInquiry,
};
