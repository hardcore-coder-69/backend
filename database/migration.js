const mysql = require('mysql');
const config = require('config')

const DATABASE = config.get('database')
const connection = mysql.createConnection({
    host: 'localhost',
    user: config.get('user'),
    password: config.get('password'),
    multipleStatements: true
});

connection.connect((err) => {
    if (err) return console.log(err.message);

    console.log("Database connected!");

    connection.query('CREATE DATABASE IF NOT EXISTS ' + DATABASE, (err, data) => {
        if (err) return console.log(err.message)

        console.log(`Database "${DATABASE}" created successfully`)

        connection.query('USE ' + DATABASE, (err, data) => {
            if (err) return console.log(err.message)
            console.log(`Using database "${DATABASE}"`)

            const UserTable = `CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`
            connection.query(UserTable, (err, data) => {
                if (err) return console.log(err.message)
                console.log(`User table created successfully`)

                const BooksTable = `CREATE TABLE IF NOT EXISTS books (
                    book_id VARCHAR(255) PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    author VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
                )`
                connection.query(BooksTable, (err, data) => {
                    if (err) return console.log(err.message)

                    console.log(`Books table created successfully`)
                })

                connection.end((err) => {
                    if (err) return console.log(err.message);
                    console.log('Connection closed!');
                });
            })
        })
    })
});