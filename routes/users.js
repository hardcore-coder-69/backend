const express = require('express')
const mysql = require('mysql');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4 } = require('uuid')
const { check, validationResult } = require('express-validator')

const config = require('config')
const router = express.Router()

const connection = mysql.createConnection({
    host: 'localhost',
    user: config.get('user'),
    password: config.get('password'),
    database: config.get('database'),
    multipleStatements: true
});


// @route       POST  /users/register
// @desc        Register user
// @access      Public

router.post('/register',
    [
        check('firstName', 'First name is required').not().isEmpty(),
        check('lastName', 'Last name is required').not().isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Password must be atleast 6 characters long').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        let { firstName, lastName, email, password } = req.body

        try {
            const CheckForExistingUser = `SELECT * FROM users WHERE email="${email}"`
            connection.query(CheckForExistingUser, async (err, data) => {
                if (err) {
                    console.error(err.message)
                    res.status(500).send('Server crashed')
                }

                let user = data[0]

                if (user && user.email) {
                    return res.status(400).json({ errors: [{ msg: 'Email already exists' }] })
                }

                const salt = await bcrypt.genSalt(10)

                const hashedPassword = await bcrypt.hash(password, salt)

                let NewUser = { firstName, lastName, email, password, id: v4() }
                const InsertUserQuery = `INSERT INTO users (id, first_name, last_name, email, password)
                                    VALUES ("${NewUser.id}", "${firstName}", "${lastName}", "${email}", "${hashedPassword}")`

                await connection.query(InsertUserQuery)

                let payload = {
                    user: {
                        id: NewUser.id
                    }
                }

                jwt.sign(payload, config.get('jwtSecretToken'), { expiresIn: 360000 }, (err, token) => {
                    if (err) throw err

                    let returnableUser = {
                        name: firstName + ' ' + lastName,
                        email: email
                    }
                    res.status(200).json({ token: token, user: returnableUser })
                })
            })

        }
        catch (err) {
            console.error(err.message)
            res.status(500).send('Server crashed')
        }
    })

module.exports = router


