const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Post = require('../models/posts');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const secret = process.env.APP_JWT_SECRET;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


router.post('/post', async (req, res) => {
    const { tempFilePath } = req.files.file;
    const { token } = req.cookies;
    let information = null;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        information = info;
    });

    cloudinary.uploader.upload(tempFilePath, async (err, result) => {
        const { title, summary, content } = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: result.url,
            author: information.id,
        });
        res.json(postDoc);
    })
});

router.get('/post', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;

    try {
        const [totalPosts, posts] = await Promise.all([
            Post.countDocuments(),
            Post.find()
                .populate('author', ['username'])
                .sort({ createdAt: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage),
        ]);

        if (page < 1 || page > Math.ceil(totalPosts / perPage)) {
            return res.status(400).json({ error: 'Invalid page number' });
        }

        const totalPages = Math.ceil(totalPosts / perPage);

        res.json({
            totalPages,
            currentPage: page,
            posts,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching posts.' });
    }
});


router.put("/post", async (req, res) => {
    let newPath = '';
    if (req.files && req.files.file) {
        const { tempFilePath } = req.files.file;
        try {
            const result = await cloudinary.uploader.upload(tempFilePath);
            newPath = result.url;
        } catch (err) {
            console.error('Error uploading image:', err);
            return res.status(500).json('Unable to upload image');
        }
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('You are not authorized to edit this post');
        }
        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
        });
        res.json(postDoc);
    });
});


/**
 * populate is used for ref attributes. It will fetch linked auther <--> user details instead of id. 
 * ['username'] mentions that we need to fetch username only.
 */
router.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
});

module.exports = router