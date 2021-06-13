const {user} = require("../models")
const {roomList} = require("../models")

const jwt = require('jsonwebtoken')
require('dotenv').config()
const ACCESS = process.env.ACCESS_SECRET

const messages = {results: []};

module.exports = {
  //로그인을 할때.
  loginController : async (req, res)=> {
    const {email, password } = req.body;
    const userInfo = await user.findOne({
        where: {email: email, password: password}
    });

    if(!userInfo){
        res.status(403).send({data: null, message: 'please check your email / password'});
    }
    else {
      const {email, name, mobile} = userInfo.dataValues
      const info = {
        email: email,
        name: name,
        // mobile: mobile, updateUserController에서 user 정보 변경을 하게 되면 토큰도 변경되기 때문에 mobile을 토큰 생성에서 제외해줬습니다.
      }
      const authorization = req.headers["authorization"];
      //만약 로그아웃을 하고 로그인을 하는 경우라면 token 생성이 되어 있으므로 토큰을 재생성할 필요가 없다.
      //그래서 아래 코드에서 존재할 경우와 존재하지 않을 경우를 나눠놓았습니다.
      if (!authorization) {
        const accToken = jwt.sign(info, ACCESS)
        res.status(200).json({data: {accessToken: accToken}, message: 'granted'});
      }
      else {
        res.status(200);
      }
    }
  },
  
  signupController: async (req, res)=> {
    const{email, password, name, mobile} = req.body;

    if (!email || !password || !name || !mobile) {
      return res.status(422).send("please fill in all the blanks");
    }
    else {
    const emailCheck = await user.findOne({
        where: {email: email}
    })
      if(emailCheck){
          res.status(409).send('email exists')
      } else {
          user.create({
              email: email,
              password: password,
              name: name,
              mobile: mobile
          })
          res.status(201).send(userInfo)
      }
    }
  },

  mypageController: async(req, res)=> {
    const authorization = req.headers["authorization"];

    if (!authorization) {
      res.status(400).send({ data: null, message: "invalid access token" });
    } else {
      token = authorization.split(' ')[1];
      const data = jwt.verify(token, ACCESS, (err, decoded)=> {
        if(err){
            return err.message
        } else {
            return decoded
        }
      });

      const userInfo = await user.findOne({
        where: {email: data.email, name: data.name}
      })

      if(!userInfo){
          res.status(400).send({data: null, message: 'access denied'})
      } else {
          res.status(200).json({data: {userInfo}, message: 'granted'})
      }
    }
  },

  enterRoomController: async (req, res)=> {
// 방 입장 한 사람이 제대로 된 토큰을 가지고 있는지 확인한다.
    const authorization = req.headers["authorization"];
  if (!authorization) {
    res.status(400).send({ data: null, message: "invalid access token" });
  } else {
      // 제대로 된 토큰을 가지고 있다면
    token = authorization.split(' ')[1];
    //token 안에는 유저의 정보가 들어있다
    const data = jwt.verify(token, ACCESS, (err, decoded)=> {
        if(err){
            return err.message
        } else {
            return decoded
        }
    });
    // token 해독 완료 후, 이 유저의 정보를 db에서 받아온다
    const userInfo = await user.findOne({
        where: {email: data.email, name: data.name}
    })
    // db에 존재한다고 하면, room 테이블에 해당 유저의 정보를 입력한다 (사람이 방에 들어왔으니 +1)
    // 클라이언트에서 들어가기 버튼을 누르면 req로 roomid를 받아오고 user에서 userid를 받아서 새로 만든 join table에 저장한다!!
    //(필독 !!!!!!join table을 만든 이유는 채팅방 들어갔을때 유저정보를 오른쪽 사이드에 표시하기 위해 만듬)
    const{roomId} = req.body
    join.create({
      roomId: roomId,
      userId: userInfo.id,
    })
   }
  },
  // 방 안의 사용자들의 데이터를 가져오는 함수/ 방에 입장하는 순간 enterRoom이 실행되고, getRoomUsersController이게 실행 된다. 나갈 때는 exitRoom이 실행되고, getRoomUsersController실행.
  getRoomUsersController: async(req, res)=>{
      const authorization = req.headers["authorization"];
    if (!authorization) {
      res.status(400).send({ data: null, message: "invalid access token" });
    }
    else {
        // 제대로 된 토큰을 가지고 있다면
      token = authorization.split(' ')[1];
      //token 안에는 유저의 정보가 들어있다
      const data = jwt.verify(token, ACCESS, (err, decoded)=> {
        if(err){
            return err.message
        } else {
            return decoded
        }
      })
      //(join table에 모든 이용자가 같은 roomid 와 다른 userid로 저장되어 있어서 userIdList로 클라이언트로 정보를 보내줌)
      // 내가 만약에 5번 방에 들어갔으면, 5번 방에 들어간 사람들의 id를 전부 받아오고 싶음
      const userIdList = await join.findAll({
          where: {roomId: req.body.roomId}
      })
      res.status(200).send({ "data": { userIdList }, "messages": "ok" })
    }
  },

  addRoomController : async (req, res)=> {
    const authorization = req.headers['authorization'];

    if(!authorization) {
        res.status(400).send({ "data": null, "message": "invalid access token" })
    }
    else {
      const token = authorization.split(' ')[1];
      const data = jwt.verify(token, ACCESS)
      
      const userInfo = await user.findOne({
      where: { name: data.name, email: data.email },
      });
      
      if(!userInfo) {
          res.status(400).send({ "data": null, "message": "access token has been tempered" })
      }
      else{
        roomList.create({
          name : userInfo.name,
          roomName : req.body.roomname,
          hobby : req.body.hobby
        })
        res.status(200);
      }
    }
  },

  exitRoomController: async(req, res)=>{
    // 방 입장 한 사람이 제대로 된 토큰을 가지고 있는지 확인한다.
    const authorization = req.headers["authorization"];
  if (!authorization) {
    res.status(400).send({ data: null, message: "invalid access token" });
  } else {
      // 제대로 된 토큰을 가지고 있다면
    token = authorization.split(' ')[1];
    //token 안에는 유저의 정보가 들어있다
    const data = jwt.verify(token, ACCESS, (err, decoded)=> {
        if(err){
            return err.message
        } else {
            return decoded
        }
      });
      // 나간 유저는 더이상 채팅방에 보여질 필요가 없기 때문에, 해당 정보를 room에서 제외시켜준다
      await roomList.destroy({
        where: {email: data.email}
      });
    }
  },

  mainPageController: async(req, res)=>{
    //mainPageController 기능은 로그인전 로그인후 메인페이지에서 방 목록들을 가져오는 기능을 한다.
    //로그인 전과 후 둘다 똑같은 기능을 하기위해 토큰 인증은 필요없어서 작성하지 않음. 
    const roomInfo = await roomList.findAll()
    res.status(200).send({ "data": { roomInfo }, "messages": "ok" })
  },

  messagesPostController: async(req, res)=>{
    // 8번째 줄에 선언 한 messages.results변수에 내용을 저장합니다.
    messages.results.push(req.body);
  },

  messagesGetController: async(req, res)=>{
    // 대화 내용들을 messages.results로 전달 합니다 
    res.status(200).send(JSON.stringify(messages));
  },
  
  updateUserController: async(req, res)=>{
    //유저 마이페이지 수정입니다. email과 name은 수정이 불가능하고 패스워드(password), 휴대폰 번호(mobile)만 수정이 가능하게 했습니다.
    //where통해 수정하고자하는 유저를 email을 통해 불러온 뒤, update로 수정을 진행합니다.
    //주의!! mypage 수정에 들어갔을 때 클라이언트 inputbox에 수정할 password와 mobile의 userInfo 정보가 미리 써져있어야합니다!!
    const{email, password, name, mobile} = req.body;

    const userInfo = await user.findOne({
      where: {email: email}
    });

    await user.update({
      password : password,
      mobile : mobile,
    }, {
      where : {email: userInfo.email}
    })
  },

  deleteRoomController: async(req, res)=>{
    await roomList.destroy({
      where: {roomName: req.body.roomName}
    })
  },
}