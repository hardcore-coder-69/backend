const express = require('express')
const mysql = require('mysql');
const { v4 } = require('uuid')
const { check, validationResult } = require('express-validator')

const config = require('config')
const auth = require("../middleware/auth")
const router = express.Router()

const connection = mysql.createConnection({
    host: 'localhost',
    user: config.get('user'),
    password: config.get('password'),
    database: config.get('database'),
    multipleStatements: true
});

// @route       GET  /books
// @desc        Get books by user id
// @access      Private

router.get('/', auth, async (req, res) => {

    try {
        let userId = req.user.id
        let offset = req.query.offset
        let count = req.query.count

        const FetchBooks = `SELECT * FROM books WHERE user_id="${userId}" ORDER BY updated_at DESC LIMIT ${offset}, ${count}`
        connection.query(FetchBooks, (err, data) => {
            if (err) {
                console.log(err.message)
                res.status(500).send('Server crashed')
            }

            const CountBooks = `SELECT COUNT(*) AS total FROM books WHERE user_id="${userId}"`
            connection.query(CountBooks, (err, count) => {
                if (err) {
                    console.log(err.message)
                    res.status(500).send('Server crashed')
                }

                res.status(200).json({ books: data, total: count[0].total })
            })
        })
    }
    catch (err) {
        console.error(err.message)
        res.status(500).send('Server crashed')
    }
})


// @route       POST  /books
// @desc        Add new book
// @access      Private

router.post('/', auth,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('author', 'Author name is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        let bookData = {
            title: req.body.title,
            author: req.body.author,
            book_id: v4(),
            user_id: req.user.id
        }

        try {
            const InsertBook = `INSERT INTO books (book_id, user_id, title, author)
                                VALUES ("${bookData.book_id}", "${bookData.user_id}", "${bookData.title}", "${bookData.author}")`

            connection.query(InsertBook, (err, data) => {
                if (err) {
                    console.error(err.message)
                    res.status(500).send('Server crashed')
                }

                res.status(200).json({ msg: "Book added successfully", book: bookData })
            })

        }
        catch (err) {
            console.error(err.message)
            res.status(500).send('Server crashed')
        }
    })


// @route       PUT  /books
// @desc        Edit book
// @access      Private

router.put('/', auth,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('author', 'Author name is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        let bookData = {
            title: req.body.title,
            author: req.body.author,
            book_id: req.body.book_id,
            user_id: req.user.id
        }

        const SearchBook = `SELECT book_id, user_id, title, author
                            FROM books
                            WHERE book_id="${bookData.book_id}"`

        connection.query(SearchBook, (err, data) => {
            if (err) {
                console.error(err.message)
                res.status(500).send('Server crashed')
            }

            let book = data[0]

            if (book && book.book_id) {
                const UpdateBook = `UPDATE books 
                                    SET title="${bookData.title}", author="${bookData.author}"
                                    WHERE book_id="${bookData.book_id}"`

                connection.query(UpdateBook, (err, data) => {
                    if (err) {
                        console.error(err.message)
                        res.status(500).send('Server crashed')
                    }

                    res.status(200).json({ msg: "Book updated successfully", book: bookData })
                })
            } else {
                return res.status(400).json({ errors: [{ msg: 'Book not found' }] })
            }
        })

        try {

        }
        catch (err) {
            console.error(err.message)
            res.status(500).send('Server crashed')
        }
    })

// @route       DELETE  /books
// @desc        Delete
// @access      Private

router.delete('/', auth,
    [
        check('book_id', 'Book Id is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const SearchBook = `SELECT book_id, user_id, title, author
                            FROM books
                            WHERE book_id="${req.body.book_id}"`

        connection.query(SearchBook, (err, data) => {
            if (err) {
                console.error(err.message)
                res.status(500).send('Server crashed')
            }

            let book = data[0]

            if (book && book.book_id) {
                const DeleteBook = `DELETE FROM books
                                    WHERE book_id="${req.body.book_id}"`

                connection.query(DeleteBook, (err, data) => {
                    if (err) {
                        console.error(err.message)
                        res.status(500).send('Server crashed')
                    }

                    res.status(200).json({ msg: "Book deleted successfully" })
                })
            } else {
                return res.status(400).json({ errors: [{ msg: 'Book not found' }] })
            }
        })

        try {

        }
        catch (err) {
            console.error(err.message)
            res.status(500).send('Server crashed')
        }
    })


// @route       POST  /books/search
// @desc        Search books
// @access      Private

router.post('/search', auth,
    async (req, res) => {
        const searchValue = req.body.searchValue

        try {
            const SearchBooks = `SELECT * FROM books
                                WHERE title LIKE "%${searchValue}%" OR author LIKE "%${searchValue}%"
                                ORDER BY updated_at DESC`

            connection.query(SearchBooks, (err, data) => {
                if (err) {
                    console.error(err.message)
                    res.status(500).send('Server crashed')
                }

                res.status(200).json({books: data})
            })

        }
        catch (err) {
            console.error(err.message)
            res.status(500).send('Server crashed')
        }
    })

module.exports = router