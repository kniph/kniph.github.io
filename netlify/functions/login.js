exports.handler = async function(event, context) {
  // 解析前端傳來的帳號密碼
  const { username, password } = JSON.parse(event.body);

    // 多組帳號密碼
  const users = [
    { username: "jelitest", password: "0492739116" },
    { username: "cyc0903cyc", password: "0903" },
    { username: "test", password: "temp" }
    { username: "shelly", password: "1127" }
    { username: "maggie", password: "yu631" }
    { username: "yiching", password: "0809" }
  
  ];

  const found = users.find(u => u.username === username && u.password === password);

  if (found) {
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
