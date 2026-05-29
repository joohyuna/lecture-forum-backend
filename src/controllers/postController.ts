import { Request, Response } from "express";
import postService from "../services/postService.ts";
import { CreatePostInputType } from "../schemas/post/createPostSchema.ts";
import { PostCreateInput } from "../generated/prisma/models/Post.ts";
import { AuthRequest } from "../middlewares/auth.ts";

const getPostsByCategory = async (req: Request<{ categoryId: string }>, res: Response) => {
    try {
        const categoryId = Number(req.params.categoryId);

        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 20;

        if (isNaN(categoryId)) {
            res.status(400).json({
                message: "유효하지 않은 카테고리 ID입니다.",
            });
            return;
        }

        const result = await postService.getPostsByCategory(categoryId, page, size);
        res.status(200).json({
            message: "게시글 목록을 성공적으로 불러왔습니다.",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "서버 에러가 발생되었습니다.",
        });
    }
};

const getPostById = async (req: AuthRequest<{ id: string }>, res: Response) => {
    // 원래, 글 내용 조회라는 기능엔 "조회하는 사람이 누군가"는 중요하지 않았음
    // 근데 "죄회하는 사람이" 투표를 했나 안했나를 알기 위해서는 "그 사람"이 누군가를 알아야함

    // 글의 내용을 요청하는 사람에 대한 정보를 알기 위해서는 어디에 접근해야 하는가?
    // 지금 접속한 사람에 대한 정보는
    // 프론트엔드만 저장하고 있음   => Zustand에서 찾을 수 있음 (저장하고 있으니까)
    // 백엔드는 저장하고 있지 않음  => 메모리에서 찾을 수 없음
    // 그렇기 때문에 매 번 프론트엔드가 신분증 정보를 요처(Request)의 헤더(headers)에 첨부해서 보내기 때문에
    // 매 요청 때마다 HTTP 메세지(Request)를 까서 헤더에 접근해서 헤더에서
    // 토큰을 가져와 사용자정보를 확인함
    try {
        const postId = Number(req.params.id);
        if (isNaN(postId)) {
            res.status(400).json({
                message: "유효하지 않은 게시글 ID입니다.",
            });
            return;
        }
        const userId = req.user?.id;
        const post = await postService.getPostById(postId, userId);

        res.status(200).json({
            message: "게시글을 성공적을 불러왔습니다.",
            data: post,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "서버 에러가 발생했습니다.",
        });
    }
};

const createPost = async (req: AuthRequest, res: Response) => {
    // req.body에 들어온 값들을 꺼내서, 서비비스로 보내주야함
    // 즉 req.body로 들어온 내용을 토애고 데이터베이스에 쓸수 있는 타입 객체로 바꾸서 보내야함
    try {
        // 지금 요청을 하고 있는 사람이 누군지를 알아내어, 데이터베이스에서 그 사용자 정복와 post를 연결해야 함
        // 누군지 알아내려면 그 정보를 req.headers.authorization을 까서
        // 그 token을 복호화 하면 { userId: number } 정보를 통해 user 테이블에서 사용자 정보를 불러오고
        // 그 사용자의 ID를 가지고 연결을 지어야함

        // 근데 이과정을 보니, 우리가 middleware은 만들었던 authenticate가 하는 일이랑 똑같네?
        // authenticate를 보니, req 박스에다가 이미 user라는 항복을 만들어서 스티커를 붙여서 보내주고 있네

        const user = req.user;
        if (!user) {
            return res.status(401).json({
                message: "로그인이 필요한 서비스입니다.",
            });
        }

        const { title, content, categoryId, option1Text, option2Text }: CreatePostInputType =
            req.body;
        // post 테이블은 user 테이블과 category테이블과 관계를 맺고 있음
        // option1Tex, option2Text의 문제는 undefined타입은 Javascript에만 존재하기 때문, 데이터베이스엔 없음
        const postData: PostCreateInput = {
            title,
            content,
            category: { connect: { id: categoryId } },
            user: { connect: { id: user.id } },
            option1Text: option1Text ?? null,
            option2Text: option2Text ?? null,
        };

        const newPost = await postService.createPost(postData);

        res.status(201).json({
            message: "게시글이 성공적으로 작성되었습니다.",
            data: newPost,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "게시글 작성 중 서버 에러가 발생되었습니다.",
        });
    }
};

export default {
    getPostsByCategory,
    createPost,
    getPostById,
};
