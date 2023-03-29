const User = require('../models/User')
const Note = require('../models/Notes')
const asyncHandler = require('express-async-handler')

// @desc get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
     const notes = await Note.find().lean()

    //  check if we have any note
    if(!notes?.length){
        return res.status(400).json({message: 'No note found'})
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const noteWithUser = await Promise.all(notes.map(async (note) =>{
        const user = await User.findById(note.user).lean().exec()
        return {...note, username: user.username}
    }))

    res.status(200).json(noteWithUser)
})


// @desc create new note
// @route POST /notes
// @access Private
const createNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    // Confirm data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    // Create and store the new user 
    const note = await Note.create({ user, title, text })

    if (note) { // Created 
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }

})


// @desc update note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    const {id, user, title, text, completed} = req.body

    // confirm data
    if( !id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({message: 'All fields are required'})
    }

    // Confirm note exists to update
    const note = await Note.findOne({id}).exec()

    if(!note){
        return res.status(400).json({message: 'No note found'})
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({title}).lean().exec()
   
    if (duplicate && duplicate._id.toString() !== id){
        return res.status(400).json({message: 'Duplicate note title'})
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatednote= await note.save()

    res.status(200).json(`'${updatednote.title}' updated`)
})


// @desc delete note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const {id} = req.body

    // Confirm data
    if(!id){
        return res.status(400).json({message: 'All fields  are required'})
    }

    // Confirm note exists to delete 
    const note = Note.findById(id).exec()
    if(!note){
        return res.status(400).json({message: 'No note found'})
    }

    const result = await note.deleteOne()
    const reply = `${result.title} with ID ${result._id} deleted`

    res.status(200).json(reply)

})

module.exports = {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
}