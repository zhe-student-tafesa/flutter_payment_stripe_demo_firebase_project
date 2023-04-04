var admin = require('firebase-admin');

// 读取私钥
var serviceAccount = require("./flutter-payment-stripe-demo-firebase-adminsdk-az8yd-ba0597def5.json");
// 初始化
 admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
 });