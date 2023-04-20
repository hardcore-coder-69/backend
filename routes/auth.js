const express = require('express')
const mysql = require('mysql');
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')

const auth = require('../middleware/auth')
const config = require('config')

const connection = mysql.createConnection({
    host: 'localhost',
    user: config.get('user'),
    password: config.get('password'),
    database: config.get('database'),
    multipleStatements: true
});


// @route       GET  /auth
// @desc        User Authorization
// @access      Public

router.get('/', auth, async (req, res) => {

    try {
        const SelectUserQuery = `SELECT id, first_name, last_name, email
                                FROM users
                                WHERE id="${req.user.id}"`
        connection.query(SelectUserQuery, (err, data) => {
            if (err) {
                console.error(err.message)
                res.status(500).send('Server crashed')
            }
            let user = data[0]
            res.status(200).json(user)
        })
    }
    catch (err) {
        console.error(err.message)
        res.status(500).send('Server crashed')
    }
})


// @route       POST  /auth
// @desc        User Login
// @access      Public

router.post('/', [
    check('email', 'Please enter valid email').isEmail(),
    check('password', 'Please enter password').exists()
], async (req, res) => {

    try {
        // Validate email and password
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body

        // Get user from DB
        const SelectUserQuery = `SELECT id, first_name, last_name, email, password
                                FROM users
                                WHERE email="${email}"`

        connection.query(SelectUserQuery, async (err, data) => {
            if (err) {
                console.error(err.message)
                res.status(500).send('Server crashed')
            }
            let user = data[0]

            // User not found
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
            }

            // Match password
            const isMatch = await bcrypt.compare(password, user.password)

            // Password doesn't match
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            // Generate token
            jwt.sign(payload, config.get('jwtSecretToken'), { expiresIn: 360000 }, (err, token) => {
                if (err) {
                    return res.status(400).json({ errors: [{ msg: 'Token generation failed. Please try again.' }] })
                }

                let returnableUser = {
                    name: user.first_name + ' ' + user.last_name
                }
                return res.status(200).json({ token: token, user: returnableUser })
            })
        })

    }
    catch (err) {
        console.error(err)
        res.status(500).send('Server crashed')
    }
})
module.exports = router