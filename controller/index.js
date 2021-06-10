const {users} = require("../models")
const jwt = require('jsonwebtoken')
require('dotenv').config()
const ACCESS = process.env.ACCESS_SECRET

module.exports = {
  loginController : async (req, res)=> {
    const {email, password } = req.body;
    const userInfo = await users.findOne({
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
  }
}