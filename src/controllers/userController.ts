import { Request, Response } from "express";
import { UserCreateInput } from "../generated/prisma/models/User.ts";  // 안에 있는것을 가져옴
import userService from "../services/userService.ts";
import bcrypt from "bcrypt";
import passwordUtil from "../utils/password/passwordUtil.ts";  //

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
        // 그다음 Service에서 다시 DB에셔보내준 값을 받아서
        const newUser = await userService.createUser(userData);

        // 여기서 부터는 응답(Response) 처리
        // res라는 앞으로  응답에 나갈 박스에
        // status code를 201 (생성 작업 성공의 코드)로 하고
        // 응답에 들어갈 string 데이터로 newUser를 json 가공하여 넣는다.
        res.status(201).json(newUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "유저 생성 중 오류가 발생했습니다."});
    }
};

export default {
    createUser,
};
