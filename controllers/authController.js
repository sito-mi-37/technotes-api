const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')


// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async(req, res) => {
    const {username, password} = req.body

    //check if all fields where provided
    if (!username || !password) {
        return res.status(400).json({message: "All fields are required"})
    }

    // see if user exist 

    const foundUser = await User.findOne({username}).exec()
    if (!foundUser) {
        return res.status(401).json({message: 'Unauthorized'})
    } 

    // compare password with hashed password
    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) {
        return res.status(401).json({message: 'Unau'})
    }

    // create an access token that would be sent to the client 
    const accessToken = jwt.sign(
        {
            'UserInfo': {
                username: foundUser.username,
                roles: foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '1m'}
    )

    // create a refresh token that would be used to generate subsequent access token 

    const refreshToken = jwt.sign(
        { "username": foundUser.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    )

    // create secure cookie with refresh token 
    res.cookie('jwt', refreshToken, {
        httpOnly: true, // accessable only by web server
        secure: true, // https
        sameSite: 'None', // cross site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })

    // send access token containing username and roles
    res.json(accessToken)

})


// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
    const cookies = req.cookies

    // check if cookie is available
    if(!cookies?.jwt) return res.status(401).json({message: 'Unauthorized'})

    // get the refresh token out of the cookie
    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            
            if (err) return res.status(401).json({message: 'Forbidden'})

            //find the user using the username
            const foundUser = await User.findOne({username: decoded.username}).exec()
            
            if (!foundUser) return res.status(401).json({message: 'Unauthorized'})

            // create new access token
            const accessToken = jwt.sign(
                {
                    'UserInfo' : {
                        username: foundUser.username,
                        roles: foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '1m'}
            )

            // send an access token containing username and roles
            res.json(accessToken)
        })
    )
    

}


// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists

const logout = (req, res) => {
    const cookies = req.cookies

    //check if cookie is available
    if (!cookies) return res.sendStatus(204) // no content 
    res.clearCookie('jwt', {httpOnly: true, secure: true, sameSite: 'None'})
    res.json({message: 'Cookie cleared'})
}

module.exports = {
    login,
    refresh,
    logout
}