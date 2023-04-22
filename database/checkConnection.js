const mysql = require('mysql');
const config = require('config')

const connection = mysql.createConnection({
    host: 'localhost',
    user: config.get('user'),
    password: config.get('password'),
    multipleStatements: true
});

connection.connect((err) => {
    if (err) return console.log(err.message);
    console.log("Database connected!");

    connection.end((err) => {
        if (err) return console.log(err.message);
        console.log('Connection closed!');
    });
})