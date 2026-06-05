// vote
// 사용자 정보

import prisma from "../src/config/prisma.ts";
import { User } from "../src/generated/prisma/client.ts";

async function seedVotes() {
    try {
        const posts = await prisma.post.findMany({
            where: {
                deletedAt: null,
            },
        });
        const users = await prisma.user.findMany({
            where: {
                deletedAt: null,
            },
        });
        if (posts.length === 0) {
            console.log("등록된 글이 존재하지 않습니다. 시딩은 종료합니다.");
            return;
        }

        if (users.length === 0) {
            console.log("등록된 회원이 존재하지 않습니다. 시딩을 종료합니다.");
            return;
        }
        for (const post of posts) {
            // 하나의 글에 몇 개의 투표가 이루어질지를 정함
            // 문제는 이 투표 수가 사용자 수를 넣으면 안됨
            const targetVoteCount = Math.min(Math.floor(Math.random() * 30) + 3, users.length);

            // 투표하는 사용자를 먼저 준비하고 그리고서 그 array를 forof로 돌릴것임
            // 왜냐하면 투표하는 사용자가 겹치면 안되기 때문에
            const selectedUsers: User[] = [];
            while (selectedUsers.length < targetVoteCount) {
                // 데이터베이스에서 불러온 User 목록에서 팬덤으로 1명을 뽑음
                const randomUser = users[Math.floor(Math.random() * users.length)];

                // 불러온 randomUser를 바로 selectedUses에 집어넣으면 안됨
                if (randomUser && !selectedUsers.includes(randomUser)) {
                    selectedUsers.push(randomUser);
                }
            }

            for (const selectedUser of selectedUsers) {
                // 글 선택 됐고, 사용자 선택 됐음
                const rendomOption = Math.random() < 0.5 ? 1 : 2;

                try {
                    await prisma.vote.create({
                        data: {
                            option: rendomOption,
                            user: { connect: { id: selectedUser.id } },
                            post: { connect: { id: post.id } },
                        },
                    });
                    console.log(
                        `투표 생성 완료: 사용자 ID ${selectedUser.id}, 게시글 ID ${post.id}`,
                    );
                } catch (error) {
                    console.log(
                        `투표 생성 실패: 사용자 ID ${selectedUser.id}, 게시글 ID ${post.id}`,
                    );
                }
            }
        }
    } catch (error) {
        console.log("시딩작업이 중단되었습니다.");
    } finally {
        await prisma.$disconnect();
    }
}

seedVotes().then(() => {});
