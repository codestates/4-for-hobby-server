const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser");
const fs = require("fs");
const http = require("http");
const app = express()

const port = 80;

app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT"],
  credentials : true
}
))


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
app.post("/deleteroom", mainController.deleteRoomController);



const ip = "127.0.0.1";
const server = http.createServer(app);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port);

module.exports = app