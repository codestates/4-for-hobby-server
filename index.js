const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser");
const fs = require("fs");
const http = require("http");
const app = express()

const port = 3000

app.use(bodyParser.json());
app.use(express.json());
app.use(cors())


const mainController = require("./controller");

// app.options('/', (req, res)=> {
//     res.status(200).end()
// })

// app.get('/', (req, res) => {
//   res.status(201).send('Hello World');ㄴ
// });


app.post("/signup", mainController.signupController);
app.post("/login", mainController.loginController);
app.post("/addroom", mainController.addRoomController);
app.get("/mypage", mainController.mypageController)
app.post("/enterroom", mainController.enterRoomController);
app.get("/getroomusers", mainController.getRoomUsersController);
app.get("/exitroom", mainController.exitRoomController);
app.get("/",mainController.mainPageController);
app.post("/messages", mainController.messagesPostController);
app.get("/messages", mainController.messagesGetController);



const ip = "127.0.0.1";
const server = http.createServer(app);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port);

module.exports = app