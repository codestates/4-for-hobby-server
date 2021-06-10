const {users} = require("../models")

module.exports = {
    signupController: async (req, res)=> {
    const{email, password, name, mobile} = req.body;

     if (!email || !password || !name || !mobile) {
      return res.status(422).send("please fill in all the blanks");
    }

    const emailCheck = await users.findOne({
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
}
}