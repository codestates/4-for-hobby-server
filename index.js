const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser");
const http = require("http");
const app = express()

const port = 80;
const ip = "127.0.0.1";
const server = http.createServer(app);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port);

//socket.io
const io = require('socket.io')(server, { cors: { origin: "*" } });

app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT"],
  credentials : true
}));


const mainController = require("./controller");

app.post("/signup", mainController.signupController);
app.post("/login", mainController.loginController);
app.post("/addroom", mainController.addRoomController);
app.get("/mypage", mainController.mypageController)
app.post("/enterroom", mainController.enterRoomController);
app.get("/getroomusers", mainController.getRoomUsersController);
app.post("/exitroom", mainController.exitRoomController);
app.get("/",mainController.mainPageController);
app.post("/messages", mainController.messagesPostController);
app.get("/messages", mainController.messagesGetController);
app.put("/mypageupdateuser", mainController.updateUserController);
app.post("/deleteroom/:id", mainController.deleteRoomController);
//multer
app.use('/api/product', require('./controller/image'));

//socket.io
socket.on('send', function (data) {
  // socket에 클라이언트 정보를 저장한다
  socket.name = data.name;
  socket.message = data.message;
  socket.userId = data.id;
  // 접속된 모든 클라이언트에게 메시지를 전송한다
  io.emit('sendAll', data);
});
// 클라이언트로부터의 메시지가 수신되면
socket.on('send', function (data) {
  var msg = {
    from: {
      name: data.name,
      message: data.message,
      userId: data.id
    }
  };
  // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
  socket.broadcast.emit('sendAll', msg);
});
// force client disconnect from server
socket.on('forceDisconnect', function () {
  socket.disconnect();
})

socket.on('disconnect', function () {
  console.log('user disconnected: ' + socket.name);
});

module.exports = app