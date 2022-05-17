const authorModel = require('../models/authorModel')
const blogModel = require('../models/blogModel')
const validator = require('../validator/validation')


// craete blog
const createBlog = async function (req, res) {
    try {
        let requestBody = req.body
        let idFromToken = req.authorId

        if(!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'please provide blog body' })
        }

        let isPublished = req.body.isPublished

        const { title, body, authorId, tags, category, subcategory } = requestBody

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: 'title is required' })
        }

        if (!validator.isValid(body)) {
            return res.status(400).send({ status: false, message: 'body is required' })
        }

        if (!validator.isValid(authorId)) {
            return res.status(400).send({ status: false, message: 'authorId is required' })
        }

        if(!validator.isValidObjectId(authorId)) {
            return res.status(400).send({ status: false, message: 'Invalid authorId' })
        }

        if(idFromToken != authorId) {
            return res.status(400).send({ status: false, message: 'Unauthorized Access!' })
        }

        if (!validator.isValid(tags)) {
            return res.status(400).send({ status: false, message: 'tags is required' })
        }

        if (!validator.isValid(category)) {
            return res.status(400).send({ status: false, message: 'category is required' })
        }

        if (!validator.isValid(subcategory)) {
            return res.status(400).send({ status: false, message: 'subcategory is required' })
        }

        if (isPublished === true) {
            requestBody['publishedAt'] = new Date()
        }

        const isAuthorExist = await authorModel.findById(authorId)

        if (!isAuthorExist) {
            return res.status(404).send({ status: false, message: 'AuthorId is not found in DataBase' })
        }

        const blogCreated = await blogModel.create(requestBody)

        return res.status(201).send({ status: true, message: blogCreated })

    }
    catch (error) {
        res.status(500).send({ message: error.message })
    }
}


// fetch blogs
const getBlogs= async function(req, res) {
    try {
        const data = req.query
        const blogs = await blogModel.find(data, {isDeleted:false}, {isPublished:true})//.populate("authorId")
        if (blogs.length == 0) {r
            return res.status(404).send({ status: false, message: "No blogs Available." })
        }
        res.status(200).send({ status: true, count: blogs.length, data: blogs });
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


// update blog
const updateBlog = async function (req, res) {
    try {

        let blogId = req.params.blogId
        let idFromToken = req.authorId

        if (!validator.isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, message: 'BlogId is not valid' })
        }

        if (!validator.isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, message: 'Blog Id is required' })
        }

        let isBlog = await blogModel.findById(blogId)

        if(idFromToken != isBlog.authorId) {
            return res.status(400).send({ status: false, message: 'Unauthorized Access!' })
        }

        if (!isBlog) {
            return res.status(404).send({ status: false, message: 'Blog does not exists' })
        }

        if (isBlog.isDeleted == true)  {
            return res.status(400).send({status: false, error: 'Blog is already deleted' })
        }

        let title = req.body.title
        let body = req.body.body
        let tags = req.body.tags
        let subcategory = req.body.subcategory

        if (!validator.validString(title)) {
            if (!validator.isValid(title)) return res.status(400).send({ status: false, msg: 'please provide title' })
        }

        if (!validator.validString(body)) {
            if (!validator.isValid(body)) return res.status(400).send({ status: false, msg: 'please provide body' })
        }

        if (!validator.validString(tags)) {
            if (!validator.isValid(subcategory)) return res.status(400).send({ status: false, msg: 'please provide tags' })
        }

        if (!validator.validString(subcategory)) {
            if (!validator.isValid(tags)) return res.status(400).send({ status: false, msg: 'please provide subcategory' })
        }
        
        let updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId },
            {
                $set: {
                    title: title, body: body, isPublished: true, subcategory: subcategory,
                    tags: tags, publishedAt: new Date()
                }
            }, { new: true })

        res.status(200).send({ status: true, data: updatedBlog })
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}



// blog delete by Id
const deleteId = async function (req, res) {
    try {
        let blogId = req.params.blogId
        let idFromToken = req.authorId

        if(!blogId) {
            return res.status(400).send({status: false, message: 'blogId is required'})
        }

        const findBlogs = await blogModel.findById(blogId)

        if(idFromToken != findBlogs.authorId) {
            return res.status(400).send({ status: false, message: 'Unauthorized Access!' })
        }

        if (findBlogs) {
            if (findBlogs.isDeleted == false) {
                await blogModel.findOneAndUpdate({ _id: blogId }, { isDeleted: true, deleteAt: new Date() }, { new: true })
                return res.status(200).send({ status: true, message: 'Blog Successfully Deleted' })
            }
            else {
                return res.status(200).send({ status: false, message: 'blog already deleted' })
            }
        }
        else {
            return res.status(404).send({ status: false, message: 'blogid does not exist' })
        }
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.massage })
    }
}



// delte by query
const deleteBlogByQuery = async function (req, res) {
    try {

        const requestQuery = req.query
        let idFromToken = req.authorId

        if (!validator.isValidRequestBody(requestQuery)) {
            return res.status(400).send({ status: false, message: 'Please enter filters' })
        }

        if (requestQuery.category != undefined) {
            if (!validator.isValid(requestQuery.category)) {
                return res.status(400).send({ status: false, message: 'please provide category' })
            }
        }

        if (requestQuery.subcategory != undefined) {
            if (!validator.isValid(requestQuery.subcategory)) {
                return res.status(400).send({ status: false, message: 'please provide subcategory' })
            }
        }

        if (requestQuery.tags != undefined) {
            if (!validator.isValid(requestQuery.tags)) {
                return res.status(400).send({ status: false, message: 'please provide tags' })
            }
        }

        if (requestQuery.authorId != undefined) {
            if (!validator.isValid(requestQuery.authorId)) {
                return res.status(400).send({ status: false, message: 'please provide authorId' })
            }
        }

        if (requestQuery.isPublished != undefined) {
            if (!validator.isValid(requestQuery.isPublished)) {
                return res.status(400).send({ status: false, message: 'please provide isPublished' })
            }
        }

        const blog = await blogModel.find(requestQuery)

        if (!blog) {
            return res.status(404).send({ status: false, message: 'No blog exist with given filters' })
        }

        const blogs = await blogModel.find({ authorId: req.query.authorId , isDeleted : false})

        if(idFromToken != req.query.authorId) {
            return res.status(400).send({ status: false, message: 'Unauthorized Access!' })
        }

        if (!blogs.length > 0) {
            return res.status(400).send({ status: false, message: 'Blogs are already deleted' })
        }

        const deletedBlog = await blogModel.updateMany(requestQuery, { isDeleted: true, deletedAt: new Date() }, { new: true })

        if (!deletedBlog) return res.status(404).send({ status: false, message: 'No such blog found' })
        return res.status(200).send({ message: 'blog deleted successfully' })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}



module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs;
module.exports.updateBlog = updateBlog;
module.exports.deleteId = deleteId;
module.exports.deleteBlogByQuery = deleteBlogByQuery;