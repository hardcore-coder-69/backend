const express = require('express');

const app = express()
app.use(express.json({ extended: true }))

// Add Access Control Allow Origin headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, GET, DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, x-auth-token"
    );
    next();
});

// Define Routes
app.use('/users', require('./routes/users'))
app.use('/auth', require('./routes/auth'))
app.use('/books', require('./routes/books'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log("App is running on port " + PORT)
})