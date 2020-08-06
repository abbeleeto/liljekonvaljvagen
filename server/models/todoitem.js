const mongoose = require('mongoose');

const todoitemSchema = mongoose.Schema({
    isDone: {
        type: Boolean,
        required: true
    },
    text: {
        type: String,
        maxlength: 500,
        required: true
    },
    assignedTo: {
        type: String,
        minlength: 3
    }
});

const TodoItem = mongoose.model('TodoItem', todoitemSchema);

module.exports = {TodoItem};