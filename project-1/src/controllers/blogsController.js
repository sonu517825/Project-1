const BlogsModel = require('../models/blogsModel')
const AuthorModel = require('../models/authorModel')



const createBlogs = async function (req, res) {
    try {
        let blogData = req.body
        let id = req.body.authorId

        let author = await AuthorModel.findById(id)

        if (!author) return res.status(404).send({ status: false, msg: "author id not present in your data base or your request body" })

        let blog = await BlogsModel.create(blogData)

        res.status(201).send({ status: true, data: blog })

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}




const getFilteredBlogs = async function (req, res) {
    try {
        let input = req.query

        //* below methods for converting inputData to array of objects
        let filters = Object.entries(input)
        let filtersAsObject = []


        for (let i = 0; i < filters.length; i++) {
            let element = filters[i]
            let obj = {}
            obj[element[0]] = element[1]
            filtersAsObject.push(obj)
        }

        let conditions = [{ isDeleted: false }, { isPublished: true }]
        let finalFilters = conditions.concat(filtersAsObject)

        //* handled two cases: (1) where client is using the filters (2) where client want to access all published data

        if (input) {
            if ((input.subcategory == '') || (input.tags == '') || (input.category == '') || (input.author_id == '')) {
                return res.status(400).send({ status: false, msg: "you can not select a blank property" })
            }
            else {
                let blogs = await BlogsModel.find({ $and: finalFilters }).populate(authorId)

                if (blogs.length == 0) return res.status(404).send({ status: false, msg: "no blogs found" })

                res.status(200).send({ status: true, totalDocuments: blogs.length, data: blogs })
            }
        } else {
            let blogs = await BlogsModel.find({ $and: conditions }).populate(authorId)

            if (blogs.length == 0) return res.status(404).send({ status: false, msg: "no blogs found" })

            res.status(200).send({ status: true, data: blogs })
        }
    }
    catch (error) {
        res.status(500).send({ error: error.message })
    }
}





const updateBlog = async function (req, res) {
    try {
        let id = req.params["blogId"]
        let blogData = await BlogsModel.findById(id)
        if (!blogData) return res.status(400).send({ status: false, msg: "Blog is not present for this blog id" })

        let isDeleted = blogData.isDeleted
        if (isDeleted === true) return res.status(400).send({ status: false, msg: "Your document is deleted" })

        let inputData = req.body
        let newTitle = req.body.title
        let newBody = req.body.body
        let newTag = req.body.tags
        let newSubCategory = req.body.subcategory

        if (Object.keys(inputData).length == 0) return res.status(400).send({ status: false, msg: "please provide input data in request body" })

        if (blogData.tags.includes(newTag) == true) res.status(400).send({ status: false, msg: "tag already present" })

        if (blogData.subcategory.includes(newSubCategory) == true) res.status(400).send({ status: false, msg: "subcategory already present" })

        let blog = await BlogsModel.findByIdAndUpdate(
            { _id: id },
            {
                $set: { title: newTitle, body: newBody, isPublished: true, publishedAt: Date.now() },
                $push: { tags: newTag, subcategory: newSubCategory }
            },
            { new: true })

        res.status(200).send({ status: true, data: blog })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}





const deleteBlog = async function (req, res) {
    try {
        let id = req.params.blogId

        let blogData = await BlogsModel.findById(id)
        if (!blogData) return res.status(400).send({ status: false, msg: "blogId does not exist" })

        let isDeleted = blogData.isDeleted
        if (isDeleted === true) return res.status(404).send({ status: false, msg: "No such blog found" })

        let markDirty = await BlogsModel.findByIdAndUpdate({ _id: id },
            { $set: { isDeleted: true, deletedAt: Date.now() } },
            { new: true })

        res.status(200).send()

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}



const deleteFilteredBlog = async function (req, res) {

    try {

        let input = req.query

        if (Object.keys(input).length == 0) return res.status(400).send({ status: false, msg: "please provide input" })

        if ((input.subcategory == '') || (input.tags == '') || (input.category == '') || (input.author_id == '')) {
            return res.status(400).send({ status: false, msg: "You can not select blank property" })
        }

        // below methods for converting inputData to array of objects
        let filters = Object.entries(input) //[['a' , 'b'],['c','d']]


        // let emptyInput = filters.filter(check)
        // function check(ele) {
        //     return ele[1] == ''
        // }
        // if (emptyInput.length != 0) return res.status(400).send({status:false , msg:"you can not select blank property"})


        let filtersAsObjectArray = []

        for (let i = 0; i < filters.length; i++) {
            let element = filters[i]    //element=['a','b']
            let obj = {}
            obj[element[0]] = element[1]
            // element[0]=only key name // element[1]=only value // = change to : // obj = make object like obj= {key:'value'}
            filtersAsObjectArray.push(obj)
        }

        let conditions = [{ isDeleted: false }, { isPublished: false }]
        let finalFilters = conditions.concat(filtersAsObjectArray)   // [{a:'abc'} , {b:'def'}]

        let deleteBlog = await BlogsModel.updateMany({ $and: finalFilters },
            { $set: { isDeleted: true, deletedAt: Date.now() } },
            { new: true })
        if (deleteBlog.modifiedCount == 0) return res.status(400).send({ status: false, msg: "No document present" })

        res.status(200).send({ status: true, data: deleteBlog })

    }
    catch (error) {
        res.status(500).send({ error: error.message })
    }
}




module.exports.createBlogs = createBlogs
module.exports.getFilteredBlogs = getFilteredBlogs
module.exports.updateBlog = updateBlog
module.exports.deleteBlog = deleteBlog
module.exports.deleteFilteredBlog = deleteFilteredBlog



