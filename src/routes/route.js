const express = require('express');
const router = express.Router();

const authorController = require("../controllers/authorController")
const blogController = require("../controllers/blogController")
const middleware = require("../middleware/auth")

router.post('/register', authorController.createAuthor)
router.post('/login', authorController.login)

router.post('/blogs',middleware.auth, blogController.createBlog)
router.get('/blogs',middleware.auth, blogController.getBlogs)
router.put('/blogs/:blogId',middleware.auth, blogController.updateBlog)
router.delete('/blogs/:blogId',middleware.auth, blogController.deleteId)
router.delete('/blogs',middleware.auth, blogController.deleteBlogByQuery)


module.exports = router;