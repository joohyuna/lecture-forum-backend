import jwt, { JwtPayload } from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET || "";

export interface  DecodedToken extends JwtPayload {
    // 부모자리에 자식을 쓸 수 있음
    // interface 상속을 할때 쓰고 = 생략
    id: number;
}

const generateToken = (userId: number) => { 
    // jwt.sign (신분증에 들어갈 정보, 열쇠, 옵션): 신분증을 위한 암호화 하는 베소드, 리턴값을 string
    return jwt.sign({id: userId}, SECRET_KEY, {
        expiresIn: "1d", // 하루동안 유효기간 제한
    })
};

// jsonwebtoken 개발자는, "니가 만든 신분증이 튀어나올꺼니까, JwtPayload 수정에서 써'
const verifyToken = (token: string) => {
    // jwt.verify(토큰, 열쇠): 암호화된 토큰을 복호화하는 메소드, 리턴값은 JwtPayload = {}
    return jwt.verify(token, SECRET_KEY) as DecodedToken;
};



export default {
    generateToken,
    verifyToken,
}