const User = require('../models/User')
const Note = require('../models/Notes')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    // the select('-password') tells mongoose never to send the password 
    // the lean() tells mongoose not to send an ambigeous response
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({message: 'No user found'})
    }

    res.status(200).json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body

    // Confirm data

    if( !username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'All fields are required'})
    }

    // check for duplicate

    const duplicate = await User.findOne({username}).lean().exec()
    if (duplicate) {
       return res.status(409).json({message:'duplicate username'})
    }

    // hash password

    const hashedPwd = await bcrypt.hash(password, 10) // 10 rounds of salt

    const userObject = {
        username,
        "password": hashedPwd,
        roles
    }

    // create and store new user

    const user = await User.create(userObject)

    if(user) {
        res.status(200).json({message: `New user ${username} created successfully`})
    }else{
        res.status(400).json({message: 'Invalid user data received '})
    }

})


// @desc Update  user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const {id, username, roles, active, password} = req.body 

    // confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({message: 'All fields are required'})
    }

    const user = await User.findById(id).exec()

    if (!user){
        return res.status(400).json({message: 'No user found'})
    }

    // check for duplicates

    const duplicate = await User.findOne({username}).lean().exec()

    // Allow update to the original user 
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate username'})
    }

    // update user

    user.username = username
    user.active = active
    user.roles = roles

    if(password){
        user.password = await bcrypt.hash(password, 10) // salt rounds
    }

    const updatedUser = await user.save()

    res.status(200).json({message:`${updatedUser.username} updated`})
})

// @desc Delete  user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.body

    // confirm request
    if(!id){
        return res.status(400).json({message: 'id is required'})
    }

    const note = await Note.findOne({user: id}).lean().exec()
    if (note){
        return res.status(400).json({message: 'User has assigned notes'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message: 'User not found'})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID: ${result._id} deleted`

    res.status(200).json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}