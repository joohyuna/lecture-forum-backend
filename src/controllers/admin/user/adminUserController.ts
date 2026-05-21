import { Request, Response } from "express";
import adminUserService from "../../../services/admin/user/adminUserService.ts";
import passwordUtil from "../../../utils/password/passwordUtil.ts";
import { UserCreateInput, UserUpdateInput } from "../../../generated/prisma/models/User.ts";
import { AdminCreateUserInputType } from "../../../schemas/admin/user/createUser.ts";
import { AdminUpdateUserInputType } from "../../../schemas/admin/user/updateUser.ts";

// 유저 목록 API
const getUserList = async (req: Request, res: Response) => {
    try {
        const users = await adminUserService.getUserList();
        res.status(200).json({ message: "유저 목록을 성공적으로 불러왔습니다.", data: users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "유저 목록을 불러오는 중 오류가 발생했습니다." });
    }
};

// 한개의 유저 API
const getUserById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(404).json({});
            return;
        }

        const user = await adminUserService.getUserById(id);

        res.status(200).json({ message: "유저 정보를 성공적으로 불러왔습니다.", data: user });
    } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            res.status(404).json({ message: "존재하지 않는 유저입니다." });
            return;
        }

        console.log(error);
        res.status(500).json({ message: "서버에 에러가 발생했습니다." });
    }
};

// 유저 생성 API
const createUser = async (req: Request, res: Response) => {
    try {
        // 사용자가 입력한 값을 그대로 DB에 쓰면 안됨
        // 1. 왜? 비밀번호가 평문이니깐, 암호화해서 서비스에게 넘겨줘야 함
        // 2. 타입이 안맞음. birthdate가 string으로 옴. 이걸 Date 타입으로 바꿔줘야 함

        // 프론트엔드에서 전달된 값들이 들어있는  req.body의 타입은?
        const { password, birthdate, phoneNumber, ...restData }: AdminCreateUserInputType =
            req.body;

        // 데이터베이스에서 생성할 때 집어넣을 내용으로 변환
        // prisma가 데이터베이스에서 insert 할때 필요한 타입을 미리 마련해줬다.
        const newUser: UserCreateInput = {
            ...restData,
            password: await passwordUtil.hashPassword(password),
            phoneNumber: phoneNumber ?? null, // phoneNumber가 있으면 그 값을 쓰고, 없으면 null
            birthdate: birthdate ? new Date(birthdate) : null,
        };

        const result = await adminUserService.createUser(newUser);

        res.status(200).json({
            message: "유저를 성공적으로 생성했습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "ALREADY_EXISTS_USERNAME":
                    res.status(409).json({ message: "이미 사용 중인 아이디입니다." });
                    return;
                case "ALREADY_EXISTS_EMAIL":
                    res.status(409).json({ message: "이미 가입된 이메일입니다." });
                    return;
                case "ALREADY_EXISTS_NICKNAME":
                    res.status(409).json({ message: "이미 사용 중인 닉네임입니다." });
                    return;

                // default: 그외나머지에러.. 알수없는 DB문제, Prisma이상동작,코드버그 등등..
                default:
                    console.log(error);
                    res.status(500).json({ message: "유저 생성 중 오류가 발생했습니다." });
                    return;
            }
        }

        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const updateUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                message: "유효하지 않은 사용자의 ID입니다.",
            });
            const { password, birthdate, phoneNumber, ...restData }: AdminUpdateUserInputType =
                req.body;

            // 데이터베이스에서 생성할 때 집어넣을 내용으로 변환
            // prisma가 데이터베이스에서 insert 할때 필요한 타입을 미리 마련해줬다.
            const newUser: UserUpdateInput = {
                ...restData,
            };

            // 업데이트할 데이터를 null을 집어 넣어버리면
            // prisma (DB)는 그칼럼의 값을 null로 바꿔 버림 즉 있던 값도 삭제해 버림
            if (password) {
                newUser.password = await passwordUtil.hashPassword(password);
            }
            if (phoneNumber) {
                newUser.phoneNumber = phoneNumber;
            }
            if (birthdate) {
                newUser.birthdate = new Date(birthdate);
            }

            const result = await adminUserService.updateUser(newUser, id);

            res.status(200).json({
                message: "유저를 성공적으로 생성했습니다.",
                data: result,
            });
        }
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "USER_NOT_FOUND":
                    res.status(404).json({
                        message: "사용자를 찾을수 없습니다.",
                    });
                    return;
                case "ALREADY_EXISTS_USERNAME":
                    res.status(409).json({ message: "이미 사용중인 아이디 입니다." });
                    return;
                case "ALREADY_EXISTS_EMAIL":
                    res.status(409).json({ message: "이미 가입한 이메일 입니다." });
                    return;
                case "ALREADY_EXISTS_NICKNAME":
                    res.status(409).json({ message: "이미 사용중인 닉네임 입니다." });
                    return;
            }
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    getUserList,
    getUserById,
    createUser,
    updateUser,
};
