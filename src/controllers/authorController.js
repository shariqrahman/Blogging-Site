const authorModel = require('../models/authorModel')
const validator = require('../validator/validation')
const jwt = require('jsonwebtoken')


// user register
const createAuthor = async function (req, res) {
    try {
        let requestBody = req.body;

        if(!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'please provide user body' })
        }

        const { fname, lname, title, email, password } = requestBody

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: 'fname is required'})
        }

        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: 'lname is required'})
        }

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: 'title is required'})
        }

        if ( !(title == 'Mr' || title == 'Miss' || title == 'Mrs')) {
            return res.status(400).send({ status: false, message: 'please provide valid title (Mr, Mrs and Miss)' })
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: 'email is required'})
        }

        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: 'Invalid Email' }) 
        }

        const emailAlreadyUsed = await authorModel.findOne({ email: email })
        if (emailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${email} is already in use. Please try another email Id.` })
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required'})
        }

        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: 'Password length should be 8 to 15 characters' })
        }

        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password.trim()))) {
            return res.status(400).send({ status: false, message: 'Invalid Password! please provide atleast one uppercase letter ,one lowercase, one character and one number' })
        }

        const userCreated = await authorModel.create(requestBody)

        return res.status(201).send({ message: userCreated })
    } 
    catch (error) {
        return res.status(500).send({ message: error.message })
    }
}


// user loin
const login = async function (req, res) {
    try {
        let requestBody = req.body

        if(!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'please provide login details' })
        }

        const { email, password } = req.body

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: 'email is required'})
        }

        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: 'Invalid Email' }) 
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required'})
        }

        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password.trim()))) {
            return res.status(400).send({ status: false, message: 'Invalid Password!' })
        }

        let isValidEmail = await authorModel.findOne({ email: email })

        // if (!isValidEmail) {
        //     return res.status(401).send({ status: false, message: 'Invalid Email Id' });
        // }

        let isValidPassword = await authorModel.findOne({ email: email })

        // if (!isValidPassword) {
        //     return res.status(401).send({ status: false, message: 'Invalid Password' });
        // }

        if (isValidEmail && isValidPassword) {

            //creating JWT
            let token = jwt.sign({ 
                authorId: isValidEmail._id ,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600* 24 * 7 }, 'mySecret', 
                // { expiresIn: "10h"}
            );
            res.header("x-api-key", token);
            res.status(200).send({ status: true, message: 'Author login successfully', data: { token } })
        }
        else {

            if (!isValidEmail) {
                return res.status(400).send({ status: false, message: 'Invalid Email' })
            }
            else if (!isValidPassword) {
                return res.status(400).send({ status: false, message: 'Invalid password' })
            }
        }
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.createAuthor = createAuthor
module.exports.login = login