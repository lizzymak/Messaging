const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

router.post('/register', async(req, res) => {
    const {username, password} = req.body
    
    try{
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({username, password: hashedPassword})
        await user.save()

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'})
        res.json({token, userId: user._id})
    }
    catch(err){
        res.status(400).json({ message: "User already exists" });
    }
})

router.post('/login', async (req, res) => {
    const {username, password} = req.body
    try{
        const user = await User.findOne({username})
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user._id });
    }
    catch(err){
        res.status(400).json({ message: 'Invalid Credentials' });
    }
})

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]
    if(!token) return res.status(401).json({message: 'access denied'})
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;
            next();
        } catch {
            res.status(401).json({ message: "Invalid Token" });
        }
}

router.get('/', authMiddleware, async (req, res) =>{
    try {
        const users = await User.find({ _id: { $ne: req.user.userId } }, 'username');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err });
    }
})


module.exports = router