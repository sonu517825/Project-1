const AuthorModel = require('../models/authorModel')
const jwt = require('jsonwebtoken')


const createAuthor = async function (req, res) {

    try {
        let authorData = req.body
        let author = await AuthorModel.create(authorData)
        res.status(200).send({ status: true, data: author })

    } catch (error) {
        res.status(500).send({ error: error.message })
   }
}

const login = async function (req, res){
    try{
        let username = req.body.email
        let pass = req.body.password

        if(username && pass){
            let author = await AuthorModel.findOne({email : username, password: pass})
            if(!author) return res.status(404).send({status: false, msg: "please provide valid username or password"})
            let payLoad = {authorId : author._id}
            let secret = "projectgroup3"
            let token = jwt.sign(payLoad, secret )
            res.status(200).send({status: true, data: token})

        }else{
            res.status(400).send({status: false, msg: "Please provide username and password"})
        }


    }catch (error) {
        res.status(500).send({ error: error.message })
    }
}
module.exports.createAuthor = createAuthor
module.exports.login = login