const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: {ObjectId} } = Schema;

const chatSchema = new Schema({
    room: {
        type: ObjectId,
        required: true,
        ref: 'Room',
    },
    user: {
        type: String,
        required: true,
    },
    chat: String,
    gif: String,
    createAt: {
        type: Date,
        default: Date.now,
    },
    to: {
        type: String,
    }
});

module.exports = mongoose.model('Chat', chatSchema);