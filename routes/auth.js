const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const saltRounds = 10;
const secret = process.env.APP_JWT_SECRET;

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const userDoc = await User.findOne({ email });
        if (!userDoc || !bcrypt.compareSync(password, userDoc.password)) {
            return res.status(400).json('Invalid credentials');
        }

        const token = jwt.sign(
            { username: userDoc.username, id: userDoc._id },
            secret,
            {}
        );

        res.cookie('token', token).json('ok');
    } catch (error) {
        console.error(error);
        res.status(500).json('Server error');
    }
});

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(401).json({ error: "Sorry a user with this email already exists" })
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const userDoc = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json({ error: e });
    }
});

router.get('/profile', (req, res) => {
    const { token } = req.cookies;

    console.log('token ' + token);
    console.log('secret ' + secret);

    jwt.verify(token, secret, {}, (err, info) => {
        if (err) {
            console.error('Verification Error:', err);
            res.status(401).json({ message: 'Unauthorized' });
        }
        res.json(info);
    });
});

router.post("/logout", (req, res) => {
    res.clearCookie('token').json('ok');
});

module.exports = router