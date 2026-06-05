import prisma from "../config/prisma.ts";

const getNoticeById = async (id: number) => {
    const notice = await prisma.notice.findUnique({
        where: {
            id,
        },
    });
    if (!notice) {
        throw new Error("NOT_FOUND_NOTICE");
    }
    return notice;
};

const createNotice = async (title: string, content: string) => {
    return prisma.notice.create({
        data: {
            title,
            content,
        },
    });
};

const updateNotice = async (id: number, title: string, content: string) => {
    // 그 Notice글이 살아있는지 체크
    await getNoticeById(id);

    // 업데이트를 진행해야 함
    return prisma.notice.update({
        where: {
            id,
        },
        data: {
            title,
            content,
        },
    });
};

const deleteNotice = async (id: number) => {
    // Notice글을 살아있는지 체크
    await getNoticeById(id);

    // Notice글을 삭제
    return prisma.notice.delete({
        where: {
            id,
        },
    });
};

export default {
    getNoticeById,
    createNotice,
    updateNotice,
    deleteNotice,
};
