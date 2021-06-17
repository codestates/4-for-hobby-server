const { user } = require("../models");
const { roomList } = require("../models");
const { join } = require("../models");
const { likeList } = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const ACCESS = process.env.ACCESS_SECRET;

module.exports = {
  //로그인을 할때.
  loginController: async (req, res) => {
    const { email, password } = req.body;
    const userInfo = await user.findOne({
      where: { email: email, password: password },
    });

    if (!userInfo) {
      res
        .status(403)
        .send({ data: null, message: "please check your email / password" });
    } else {
      const { email, name, mobile } = userInfo.dataValues;
      const info = {
        email: email,
        name: name,
        // mobile: mobile, updateUserController에서 user 정보 변경을 하게 되면 토큰도 변경되기 때문에 mobile을 토큰 생성에서 제외해줬습니다.
      };
      const authorization = req.headers["authorization"];
      //만약 로그아웃을 하고 로그인을 하는 경우라면 token 생성이 되어 있으므로 토큰을 재생성할 필요가 없다.
      //그래서 아래 코드에서 존재할 경우와 존재하지 않을 경우를 나눠놓았습니다.
      if (!authorization) {
        const accToken = jwt.sign(info, ACCESS);
        res
          .status(200)
          .json({ data: { accessToken: accToken }, message: "granted" });
      } else {
        res.status(200);
      }
    }
  },
  //회원가입 할 떄
  signupController: async (req, res) => {
    const { email, password, name, mobile } = req.body;

    if (!email || !password || !name || !mobile) {
      return res.status(422).send("please fill in all the blanks");
    } else {
      const emailCheck = await user.findOne({
        where: { email: email },
      });
      //이미 사용중인 이메일인지 확인합니다
      if (emailCheck) {
        res.status(409).send("email exists");
      } else {
        user.create({
          email: email,
          password: password,
          name: name,
          mobile: mobile,
        });
        res.status(201).send(userInfo);
      }
    }
  },
  //마이페이지 데이터 받아오기
  mypageController: async (req, res) => {
    const authorization = req.headers["authorization"];

    if (!authorization) {
      res.status(400).send({ data: null, message: "invalid access token" });
    } else {
      token = authorization.split(" ")[1];
      const data = jwt.verify(token, ACCESS, (err, decoded) => {
        if (err) {
          return err.message;
        } else {
          return decoded;
        }
      });

      const userInfo = await user.findOne({
        where: { email: data.email, name: data.name },
      });

      if (!userInfo) {
        res.status(400).send({ data: null, message: "access denied" });
      } else {
        res.status(200).json({ data: { userInfo }, message: "granted" });
      }
    }
  },
  //방 입장 할 때
  enterRoomController: async (req, res) => {
    // 방 입장 한 사람이 제대로 된 토큰을 가지고 있는지 확인한다.
    const authorization = req.headers["authorization"];
    if (!authorization) {
      res.status(400).send({ data: null, message: "invalid access token" });
    } else {
      // 제대로 된 토큰을 가지고 있다면
      token = authorization.split(" ")[1];
      //token 안에는 유저의 정보가 들어있다
      const data = jwt.verify(token, ACCESS, (err, decoded) => {
        if (err) {
          return err.message;
        } else {
          return decoded;
        }
      });
      // token 해독 완료 후, 이 유저의 정보를 db에서 받아온다
      const userInfo = await user.findOne({
        where: { email: data.email, name: data.name },
      });
      // db에 존재한다고 하면, room 테이블에 해당 유저의 정보를 입력한다 (사람이 방에 들어왔으니 +1)
      // 클라이언트에서 들어가기 버튼을 누르면 req로 roomid를 받아오고 user에서 userid를 받아서 새로 만든 join table에 저장한다!!
      //(필독 !!!!!!join table을 만든 이유는 채팅방 들어갔을때 유저정보를 오른쪽 사이드에 표시하기 위해 만듬)
      const { roomId } = req.body;
      join.create({
        roomId: roomId,
        userId: userInfo.id,
      });
    }
  },
  // 방 안의 사용자들의 데이터를 가져오는 함수/ 방에 입장하는 순간 enterRoom이 실행되고, getRoomUsersController이게 실행 된다. 나갈 때는 exitRoom이 실행되고, getRoomUsersController실행.
  getRoomUsersController: async (req, res) => {
    const authorization = req.headers["authorization"];
    if (!authorization) {
      res.status(400).send({ data: null, message: "invalid access token" });
    } else {
      // 제대로 된 토큰을 가지고 있다면
      token = authorization.split(" ")[1];
      //token 안에는 유저의 정보가 들어있다
      const data = jwt.verify(token, ACCESS, (err, decoded) => {
        if (err) {
          return err.message;
        } else {
          return decoded;
        }
      });
      //(join table에 모든 이용자가 같은 roomid 와 다른 userid로 저장되어 있어서 userIdList로 클라이언트로 정보를 보내줌)
      // 내가 만약에 5번 방에 들어갔으면, 5번 방에 들어간 사람들의 id를 전부 받아오고 싶음
      const userIdList = await join.findAll({
        where: { roomId: req.body.roomId },
      });
      const userNames = [];
      for (let i = 0; i < userIdList.length; i++) {
        const member = await user.findOne({
          where: { id: userIdList[i].userId },
        });
        userNames.push({ name: member.name });
      }
      res.status(200).send({ data: { userNames }, messages: "ok" });
    }
  },
  //방 생성 할 떄 db에 레코드 추가(들어온 유저의 정보)
  addRoomController: async (req, res) => {
    const authorization = req.headers["authorization"];

    if (!authorization) {
      res.status(400).send({ data: null, message: "invalid access token" });
    } else {
      const token = authorization.split(" ")[1];
      const data = jwt.verify(token, ACCESS);

      const userInfo = await user.findOne({
        where: { name: data.name, email: data.email },
      });
      //클라이언트에서 방 이름을 req로 보내주면, db에서 확인을 해준다 (중복인지 아닌지 + 유저인지 아닌지). 아니라면 방을 하나 생성한다
      const sameRoom = await roomList.findOne({
        where: { roomName: req.body.roomName },
      });

      if (!userInfo || sameRoom) {
        res
          .status(400)
          .send({ data: null, message: "access token has been tempered" });
      } else {
        roomList.create({
          name: userInfo.name,
          roomName: req.body.roomName,
          hobby: req.body.hobby,
        });
        res.status(200);
      }
    }
  },
  // 방 나갈 떄 db에서 해당 레코드 삭제(나간 사람의 레코드)
  exitRoomController: async (req, res) => {
    // 방 입장 한 사람이 제대로 된 토큰을 가지고 있는지 확인한다.
    const authorization = req.headers["authorization"];
    if (!authorization) {
      res.status(400).send({ data: null, message: "invalid access token" });
    } else {
      // 제대로 된 토큰을 가지고 있다면
      token = authorization.split(" ")[1];
      //token 안에는 유저의 정보가 들어있다
      const data = jwt.verify(token, ACCESS, (err, decoded) => {
        if (err) {
          return err.message;
        } else {
          return decoded;
        }
      });

      const userInfo = await user.findOne({
        where: { email: data.email, name: data.name },
      });
      // 나간 유저는 더이상 채팅방에 보여질 필요가 없기 때문에, 해당 정보를 room에서 제외시켜준다
      // join테이블의 해당 이름과 이메일을 가지고 있는 유저를 제외 시켜준다
      await join.destroy({
        where: { userId: userInfo.id },
      });
    }
  },
  //mainPageController 기능은 로그인전 로그인후 메인페이지에서 방 목록들을 가져오는 기능을 한다.
  mainPageController: async (req, res) => {
    //로그인 전과 후 둘다 똑같은 기능을 하기위해 토큰 인증은 필요없어서 작성하지 않음.
    const roomData = await roomList.findAll();
    res.status(200).send({ data: { roomData }, messages: "ok" });
  },
  //유저 마이페이지 수정입니다. email과 name은 수정이 불가능하고 패스워드(password), 휴대폰 번호(mobile)만 수정이 가능하게 했습니다.
  updateUserController: async (req, res) => {
    //where통해 수정하고자하는 유저를 email을 통해 불러온 뒤, update로 수정을 진행합니다.
    //주의!! mypage 수정에 들어갔을 때 클라이언트 inputbox에 수정할 password와 mobile의 userInfo 정보가 미리 써져있어야합니다!!
    const { email, password, name, mobile } = req.body;

    const userInfo = await user.findOne({
      where: { email: email },
    });

    await user.update(
      {
        password: password,
        mobile: mobile,
      },
      {
        where: { email: userInfo.email },
      }
    );
  },
  //방 삭제 기능
  deleteRoomController: async (req, res) => {
    await roomList.destroy({
      where: { roomName: req.params.id },
    });
  },
  //각 방들의 좋아요 개수를 받아올 때
  postLikeNumController: async (req, res) => {
    const likeTable = await likeList.findAll({
      where: { likeNum: null },
    });
    res.status(200).send({ data: likeTable });
  },
};

//좋아요 기능
// likeController: async (req, res) => {
//   const authorization = req.headers["authorization"];
//   if (!authorization) {
//     res.status(400).send({ data: null, message: "invalid access token" });
//   }
//   const { roomId, userId } = req.body;
//   const check = await likeList.findOne({
//     where: { roomId: roomId },
//   });
//   if (!check) {
//     await likeList.create({
//       roomId: roomId,
//       likeNum: 1,
//     });
//     await likeList.create({
//       roomId: roomId,
//       userId: userId,
//       likeStatus: true,
//     });

//     const likeTable = await likeList.findOne({
//       where: { roomId: roomId },
//     });
//     res.status(200).send({ data: likeTable.likeNum });
//   } else {
//     // 방이 있을 때. 2가지 (1) 다른 유저가 누를 때like +1 // (2) 같은 유저가 누를 떄like -1
//     const checkUser = await likeList.findOne({
//       where: { roomId: roomId, userId: userId },
//     });
//     if (!checkUser) {
//       await likeList.create({
//         roomId: roomId,
//         userId: userId,
//         likeStatus: true,
//       });
//       await likeList.increment({
//         likeNum,
//         where: { roomId: roomId },
//       });
//     } else {
//       await likeList.update({
//         likeStatus: false,
//         where: { roomId: roomId },
//       });
//       await likeList.decrement({
//         likeNum,
//         where: { roomId: roomId },
//       });
//     }
//     const likeTable = await likeList.findOne({
//       where: { roomId: roomId },
//     });
//     res.status(200).send({ data: likeTable.likeNum });
//   }
// },

//
