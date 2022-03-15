const BlogsModel = require('../models/blogsModel')
const AuthorModel = require('../models/authorModel')

const createBlogs = async function (req, res) {
    try {
        let blogData = req.body
        let id = req.body.authorId
        // request body validation 
        if (Object.keys(blogData).length == 0) return res.status(400).send({ status: false, msg: "Please provide input data" })
        // input author id  validation
        if (!id) return res.status(400).send({ status: false, msg: "Please provide author ID" })
        //author validation 
        let author = await AuthorModel.findById(id)

        if (!author) return res.status(404).send({ status: false, msg: "Please provide valid author ID" })

        let blog = await BlogsModel.create(blogData)
        res.status(201).send({ status: true, data: blog })

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}


const getFilteredBlogs = async function (req, res) {
    try {
        let filters = req.query
        if (filters) {
            let blogs = await BlogsModel.find({ $and : [ filters, {isDeleted: false}, {isPublished: true }]})
            if (blogs.length == 0) return res.status(404).send({ status: false, msg: "no blogs found" })
            res.status(200).send({ status: true, data: blogs })
        } else {
            let blogs = await BlogsModel.find({ isDeleted: false, isPublished: true })
            if (blogs.length == 0) return res.status(404).send({ status: false, msg: "no blogs found" })
            res.status(200).send({ status: true, data: blogs })
        }
    }
    catch (error) {
        res.status(500).send({ error: error.message })
    }
}

const updateBlog = async function (req, res) {

    let inputData = req.body
    let newTitle = req.body.title
    let newBody = req.body.body
    let newTag = req.body.tags
    let newSubCategory = req.body.subcategory
    let id = req.params["blogId"]
    try {
        if (Object.keys(inputData).length == 0) return res.status(400).send({ status: false, msg: "please provide input data" })

        if (!id) return res.status(400).send({ status: false, msg: "please provide id" })

        let blog = await BlogsModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: { title: newTitle, body: newBody, isPublished: true, publishedAt: Date.now() }, $push: { tags: newTag, subcategory: newSubCategory } },
            { new: true }
        )

        if (!blog) return res.status(404).send({ status: false, msg: "please provide a valid id" })

        res.status(200).send({ status: true, data: blog })
    } catch (error) {
        console.log(error.message)
   }

}

const deleteBlog = async function (req, res) {
    try {
        let id = req.params.blogId
        if (!id) return res.status(400).send({ status: false, msg: "please provide id" })

        let blog = await BlogsModel.findOne({ _id: id, isDeleted: false })

        if (!blog) return res.status(404).send({ status: false, msg: "please provide valid id" })

        let markDirty = await BlogsModel.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

        res.status(200).send()

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

const deleteFilteredBlog = async function (req, res) {
    try {
        let input = req.query
        
        if(Object.keys(input).length == 0) return res.status(400).send({status: false, msg: "please provide input data" })
        let deletedBlog = await BlogsModel.updateMany({ $and: [input, { isDeleted: false }] }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        
        res.status(200).send()
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}



module.exports.createBlogs = createBlogs
module.exports.getFilteredBlogs = getFilteredBlogs
module.exports.updateBlog = updateBlog
module.exports.deleteBlog = deleteBlog
module.exports.deleteFilteredBlog = deleteFilteredBlog
