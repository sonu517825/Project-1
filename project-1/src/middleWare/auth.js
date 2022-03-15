const jwt = require('jsonwebtoken')
const BlogsModel = require('../models/blogsModel')

const authentication = async function(req, res, next){

    let token = req.headers["x-auth-token"]
    if(!token) return res.status(400).send({status: false, msg: "please provide token" })
    let validateToken = jwt.verify(token, "projectgroup3")
    if(!validateToken) return res.status(404).send({status: false, msg: "authentication failed"})
    
    req['x-api-key'] = token
    next()
}

const authorization = async function (req, res, next){

    let id = req.params.blogId
    let jwtToken = req['x-api-key']
    if(!id) return res.status(400).send({status: false, msg: "please provide blog ID"})
    let blogs = await BlogsModel.findById(id)
    if(!blogs) return res.status(404).send({status: false, msg: "please provide valid blog ID"})
  
    let verifiedToken = jwt.verify(jwtToken, "projectgroup3")
    if(verifiedToken.authorId != blogs.authorId) return  res.status(404).send({status: false, msg: "unauthorize access "})

    next()


}

module.exports.authentication = authentication
module.exports.authorization = authorization