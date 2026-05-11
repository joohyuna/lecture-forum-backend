import { Request, Response } from "express";
import { UserCreateInput } from "../generated/prisma/models/User.ts"; // 안에 있는것을 가져옴
import userService from "../services/userService.ts";
import bcrypt from "bcrypt";
import passwordUtil from "../utils/password/passwordUtil.ts";
import { LoginInputType } from "../schemas/user/login.ts"; //

const createUser = async (req: Request, res: Response) => {
    try {
        // 프론트엔드가 요청한 정보를 꺼냄
        // 프론트엔드에서 JSON string인데 express통해서 객체화 된것이다.

        const { username, password, name, nickname, email, phoneNumber, birthdate, gender, role } =
            req.body;

        // JSON -> 객체로 바꿀때 가능한것, string, boolean, number, null만 가능함
        // 날짜는 JSON.parse() 해도 string
        // userCreateInput 에 이미 prisma가  Type을 만들어 놨음

        // bcrypt.hash(암호화할 string, 암호화단계숫자) : 비동기함수, 단방향 암호화 메서드
        const userData: UserCreateInput = {
            username,
            password: await passwordUtil.hashPassword(password),
            name,
            nickname,
            email,
            phoneNumber,
            birthdate: birthdate ? new Date(birthdate) : null,
            gender,
            role,
        };
        // newUser를 가지고 DB에 저장 -> service로 보내야 됨
        // 그다음 Service에서 다시 DB에서 보내준 값을 받아서
        const newUser = await userService.createUser(userData);

        // 여기서 부터는 응답(Response) 처리
        // res라는 앞으로  응답에 나갈 박스에
        // status code를 201 (생성 작업 성공의 코드)로 하고
        // 응답에 들어갈 string 데이터로 newUser를 json 가공하여 넣는다.
        res.status(201).json(newUser);
    } catch (error) {
        // 모든 에러에 대해서 처리를 해줄 수 없음.
        // 내가 처리해줄 수 있는 대표적 에러에 대해서 대체함
        // 매개변수 error는 unknown타입 입
        // unknown 타입은 any 타입처럼 모든 값들이 저장될 수 잇는 타입이지만,
        // 사용하기 위해서는 내로밍(타입좁힘)을 통해 사용이 가능함
        // typeof 연산자는 데이터타입을 문자열로 반환 진짜 원시타입일때만 사용하는 편임 예) Number = "Number" 로 반환
        // instanceof 연산자는 : 대상 변수가 이 타입인지 확인을 할 때 사용하는 연산자
        // 리턴은 Boolean (true/false) 로 나옴
        // Controller 에 도착하는 에러는 자바스크립트 표준규격의 에러일 것이다.
        // 하지만 실제 에러가 발생되는 지점은 prisma의 에러이고, 얘는 자바스크립트 표준 규격이 아님
        if (error instanceof Error) {
            switch (error.message) {
                case "ALREADY_EXISTS_USERNAME":
                    res.status(400).json({ error: "이미 사용 중인 아이디입니다." });
                    return;
                case "ALREADY_EXISTS_EMAIL":
                    res.status(409).json({ error: "이미 사용중인 이메일 입니다." });
                    return;
                case "ALREADY_EXISTS_NICKNAME":
                    res.status(409).json({ error: "이미 사용중임 닉네임입니다." });
                    return;
                default:
                    console.log(error);
                    res.status(500).json({ message: "유저 생성 중 오류가 발생했습니다." });
            }
        }
        // username에 겹칠때
        // nickname에 겹칠때
        // email이 겹칠때

        console.log(error);
        res.status(500).json({ message: "유저 생성 중 오류가 발생했습니다." });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        // login 이라는 기능은, 들어온 비밀번호 값과 데이터베이스에서 조회에서 가져온 비밀멎놓 값을
        // 비교해야함
        // 무언가를 를 controller 에서 해주기보다 DB에서 값을 가져오는게 우선되므로
        // 그냥 서비스로 바로 보냄
        const loginData: LoginInputType = req.body;

        const result = await userService.login(loginData);

        res.status(200).json({
            message: "로그인에 성공했습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVALID_CREDENTIALS") {
                res.status(401).json({
                    message: "아이디 또는 비밀번호가 일치하지 않습니다",
                });
                return;
            }
        }
        console.log(error);
        res.status(500).json({
            message: "로그닝 처리 중 서버 에러가 발생했습니다. ",
        });
    }
};

export default {
    createUser,
    login,
};
