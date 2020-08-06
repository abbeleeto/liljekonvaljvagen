const mongoose = require('mongoose');
const {TodoItem} = require('./todoitem');

const todoSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100,
        minlength: 5
    },
    description: {
        type: String,
        required: false,
        maxlength: 500
    },
    createdAt: {
        type: String
    },
    createdBy: {
        type: String,
        required: true
    },
    assignedTo: {
        type: String
    },
    items: {
        type: Array
    },
    isDeleted: {
        type: Boolean,
        required: true
    }
},
{
    timestamps: true
});

const Todo = mongoose.model('Todo', todoSchema);

/* Todo.findByIdAndDelete = (id, cb) => {
    Model.findByIdAndDelete(id, (err, data) => {
        err ? cb(err, null) : cb(null, data);
    });
}
 */
module.exports = {Todo};

