import bcrypt from 'bcrypt';

// 고정값이라서 따로 저장
const SALT_ROUNDS = 10;

// 암호화를 뱉어 내는 함수
// 타입 Promise string
// 비동기 함수 인데 바로 return 하기 때문에 await 생략
const hashPassword = async (password: string) => {
   return bcrypt.hash(password, SALT_ROUNDS);
}

// 암호화한 값을 비교 하는 함수 검증하는 함수
const verifyPassword = async (plainPassword: string, hashedPassword: string) => {
    // bcrypt.compare(비교할원래텍스트, 비교할암호화텍스트) : 비동기함수, 두개의 값을 비교해서 boolean을 리턴
    // 타입 프로미스 블리언 Promise Boolean
    // 비교해 주는 메소드 compare
    return bcrypt.compare(plainPassword, hashedPassword);
}

// 다른곳에서 사용할수 있게 내보내 준다
export default {
    hashPassword,
    verifyPassword,
};