const oracledb = require('oracledb');

//import { level, title, problem_description, language_extension, code, runtime, memory } from './parsing.js';
import { a_no } from '../../searchEmail.js';

async function insertDataIntoOracleDB(data) {
  const user = process.env.ORACLE_USER; // 시스템 변수에 값을 넣어서 보안에 신경 씀(하드 코딩을 하면 보안에 취약함)
  const password = process.env.ORACLE_PASSWORD; // 어떤 계정 쓰는 지 몰라서 아직 값은 않 넣어둔 상태
  try {
    const connection = await oracledb.getConnection({
      user: user,
      password: password,
      connectString: '연결_문자열',
    });

    // 코딩테스트 번호 최대값+1해서 인서트
    const sql3 = 'SELECT NVL(MAX(ct_no), 4000)+1 FROM coding_test';
    const ct_no = await connection.execute(sql3);
   

    const sql = `INSERT INTO coding_test (ct_no, a_no, p_title, p_level, p_timer, p_time, p_memory, p_code, p_content, p_date, p_lang) VALUES (:ctNo, :aNo, :pTitle, :pLevel, :pTimer, :pTime, :pMemory, :pCode, :pContent, :pDate, :pLang)`;

    // SQL 문에 값을 바인딩
    const binds = {
      ctNo: 1, // 테스트로 하기 위해서 1를 사용 원래 값 ct_no
      aNo: 1, // 테스트로 하기 위해서 1를 사용 a_no
      pTitle: data.title,
      pLevel: data.level,
      pTimer: '22:32', // 테스트를 하기 위해서 수정 원래 값 data.elapsedTime
      pTime: data.runtime,
      pMemory: data.memory,
      pCode: data.code,
      pContent: data.problem_description,
      pDate: { type: oracledb.DATE, dir: oracledb.BIND_IN, val: new Date() },
      pLang: data.language_extension,
    };

    // SQL 문을 실행
    const result = await connection.execute(sql, binds, { autoCommit: true });

    console.log('데이터가 성공적으로 삽입되었습니다.');

    // 연결을 종료합니다.
    await connection.close();
  } catch (error) {
    console.error('데이터를 삽입하는 중 오류가 발생했습니다(insertDataIntoOracleDB):', error);
  }
}

// const data = {
//   level: level,
//   title: title,
//   problem_description: problem_description,
//   language_extension: language_extension,
//   code: code,
//   runtime: runtime,
//   memory: memory,
//   p_timer: elapsedTime,
// };
