exports.handler = async function(event, context) {
  const { username, password } = JSON.parse(event.body);

  // 這裡設定你的帳號密碼
  const validUser = "jelitest";
  const validPass = "0492739116";

  if (username === validUser && password === validPass) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: false, message: "帳號或密碼錯誤" })
    };
  }
};
