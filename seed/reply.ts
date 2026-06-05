import prisma from "../src/config/prisma.ts";

const mockReplyList = [
    "이건 솔직히 논란의 여지가 없다 ㅋㅋㅋ 무조건 1번이지",
    "2번 고른 사람들은 진짜 맛알못인가... 진지하게 이해가 안 가네",
    "진지하게 과학적 근거를 대자면 1번이 맞음. 반박 시 내 말이 맞음",
    "아니 2번이 진리인데 왜 표가 이거밖에 안나옴? 집단 지성 다 죽었냐?",
    "중립 기어 박으려다가 1번 진영 논리보고 감탄해서 바로 1번 찍고 갑니다.",
    "와 실시간으로 투표결과 박빙인거 봐라 ㅋㅋㅋ 전장 웅장해진다.",
    "오늘도 평화로운 대난투 전장... 난 외롭게 2번에 한 표 던진디",
    "1번 고른 형들 나중에 나랑 키보드로 한판  더 뜨자",
    "이건 가치관의 차이라 정답이 없지만, 어쨌든 내 선택은 2번임.",
    "와 ... 댓글 창 보러 들어왔는데 예상대로 혼돈의 카오스네 ㅋㅋㅋ",
    "다들 진정해... 어차피 내일 출근해야 되잖아...",
    "이 토론 올린 사람 칭찬해. 간만에 도파민 터지는 주제네.",
];

async function seedReplies() {
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
            // 몇개의 댓글을 등록할 것인가를 이 아래애 작성
            // Math.random() : 0 이상 1미만의 소숫점 포함 실수 (0 ~ 0.99999999)
            // targetReplyCount는 3부터 12까지의 숙자가 랜덤
            const targetReplyCount = Math.floor(Math.random() * 10) + 3;

            for (let i = 0; i < targetReplyCount; i++) {
                // 여기에서 실제로 댓글이 등록되는 코드
                // 댓글을 등ㅇ록하는 사용자도 랜덤으로 뽑을 것
                // 100개의 사용자가 있다면 그 중 한명을 뽑아서 댓글 등록자로 지정
                const user = users[Math.floor(Math.random() * users.length)];
                const content = mockReplyList[Math.floor(Math.random() * mockReplyList.length)];
                if (!user) {
                    return null;
                }

                if (!content) {
                    return null;
                }
                try {
                    // 실제로 댓글을 등록하는 작업
                    // service를 이용해도 되고, prisma을 직접 이용해도 됨
                    await prisma.reply.create({
                        data: {
                            content,
                            post: { connect: { id: post.id } },
                            user: { connect: { id: user.id } },
                        },
                    });
                    console.log(
                        `[postId : ${post.id} (${i + 1}/${targetReplyCount})] 댓글 작성 완료`,
                    );
                } catch (error) {
                    console.log(
                        `[postId : ${post.id} (${i + 1}/${targetReplyCount})] 댓글 작성 실패`,
                    );
                }
            }
        }
    } catch (error) {
        console.log("댓글 등록 기능 중지됨");
    } finally {
        // 데이터베이스에 접근하기 위해서 백엔드에서는 prisma
        // HTTP 통신은 요청을 하고 나서 응답을 받으면 연결이 끊어진다.
        // 백엔드에서 데이터베이스와의 통신(prisma) 끊어지지 않는다. 프로그램을 닫거나 끊어줘야 한다.
        // 데이터 베이스 연결을 끊은 메서드
        await prisma.$disconnect();
    }
}

seedReplies().then(() => {});


