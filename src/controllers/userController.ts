import { Request, Response } from "express";

const createUser = (req: Request, res: Response) => {
    // 프론트엔드가 요청한 정보를 꺼냄
    // 프론트엔드에서 JSON string인데 express통해서 객체화 된것이다.

    const { username, password, name, nickname, email, phoneNumber, birthdate, gender, role } =
        req.body;

    // JSON -> 객체로 바꿀때 가능한것, string, boolean, number, null만 가능함
    // 날짜는 JSON.parse() 해도 string

    const newUser = {
        username,
        password,
        name,
        nickname,
        email,
        phoneNumber,
        birthdate: birthdate ? new Date(birthdate): null,
        gender,
        role
    }
    // newUser를 가지고 DB에 저장 -> service로 보내야 됨
};

export default {
    createUser,
};
