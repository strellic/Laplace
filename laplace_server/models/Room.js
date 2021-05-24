import mongoose from 'mongoose';
import validator from 'validator';
import uniqueValidator from 'mongoose-unique-validator';

const Schema = mongoose.Schema;

const roomSchema = Schema({
    title: {
        type: String,
        required: true,
        maxlength: 30
    },
    desc: {
        type: String,
        required: true,
        maxlength: 280
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
        minlength: 6
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    public: {
        type: Boolean,
        required: true,
        default: false
    }
});

roomSchema.plugin(uniqueValidator);

export default mongoose.model('Room', roomSchema);