const {user} = require("../models")
const jwt = require('jsonwebtoken')
const { ExclusionConstraintError } = require('sequelize')
require('dotenv').config()
const ACCESS = process.env.ACCESS_SECRET

module.exports = {
  loginController : async (req, res)=> {
    const {email, password } = req.body;
    const userInfo = await user.findOne({
        where: {email: email, password: password}
    });

    if(!userInfo){
        res.status(403).send({data: null, message: 'please check your email / password'});
    } else {
        const info = {
            email: userInfo.email,
            name: userInfo.name,
            mobile: userInfo.mobile,
        }

        const accToken = jwt.sign(info, ACCESS)
        res.status(200).json({data: {accessToken: accToken}, message: 'granted'})
    }
  },
  
  signupController: async (req, res)=> {
    const{email, password, name, mobile} = req.body;

     if (!email || !password || !name || !mobile) {
      return res.status(422).send("please fill in all the blanks");
    }

    const emailCheck = await user.findOne({
        where: {email: email}
    })

    if(emailCheck){
        res.status(409).send('email exists')
    } else {
        users.create({
            email: email,
            password: password,
            name: name,
            mobile: mobile
        })
        res.status(201).send(userInfo)
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
          roomlist.create({
            name : userInfo.name,
            roomname : req.body.roomname,
            hobby : req.body.hobby
          })
          res.status(200).send(roominfo);
      }
    }
  }
}