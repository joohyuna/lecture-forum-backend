import dotenv from "dotenv";
import express from "express";
import userRouter from "./routes/userRouter.ts";
import cors from "cors";
import adminRouter from "./routes/admin/adminRouter.ts";
import categoryRouter from "./routes/categoryRouter.ts";

dotenv.config();

const app = express(); // 1. 이줄과

const PORT = process.env.PORT || "8080";

// express 앱에 기능을 확장할 때에는 app.use() 메서드 사용

// app.use("/") 모든것에 대해서

// 교차 출처 리소스 공유 (CORS)를 허용하는건 백엔드에서 증명하여 허용해야함
// cors()만 사용하면 모든 프론트엔드 주소에 대해 허용 증명하는것
// cors({origin: "주소"})를 통해 특정 주소에 대홰서만 허용 증명 할 수 있음
// 모든 요청에 대해
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// express.json() : 요청(Request)의 본문(body)에서 JSON에 데이터를 객체로 변환 (파싱)하여 request.body에 저장
// 모든 요청을 제이슨으로 변환하는
app.use(express.json()); // 얘도 미들웨어

// express.urlencoded : 요청(Request)으로 본문 에서 URL-encoded 데이터를 객체로 변환(파싱)하여 request.body에 저장
// URL은 한글을 원래 포함 할 수 없기 때문에 변환을 하게되는데 , 그것을 한글로 받아들일 수 있도록 하는 기능
// 모든 요청에서 파싱해서
app.use(express.urlencoded({ extended: true })); // 얘도 미들웨어

// 여기까지 라우터를 만나기전, 즉 모든 요청에 대해 처리되는 미들웨어


// 프론트엔드가 요청(Request)에 대하여 경로 Routing 등록
// /user 가 나오면 userRouter로 보내
// 라우터 빼고 전부 고정 라우팅 여기만 변경된다. 나머지는 그대로 변하지 않음
app.use("/user", userRouter);

app.use("/category", categoryRouter);

// user 인지 검증 user인지 관리자 인지 확인
// 로그인 하고 authenticate 토근 인증으로 회원확인
// 그후 requiredAdmin 로 관리자 인지 확인 접근 권한 넣기
// middleware adminRouter로 이동
app.use("/admin", adminRouter);


app.listen(PORT, () => {
    console.log(`서버실행! http://localhost:${PORT}`); // 2. 이줄만 있으면  실행가능
});
