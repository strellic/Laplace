import mongoose from 'mongoose';

const Schema = mongoose.Schema;
import uniqueValidator from 'mongoose-unique-validator';

const sectionSchema = Schema({
    title: {
        type: String,
        required: true,
        maxlength: 30
    },
    type: {
        type: String,
        enum: ["info", "coding", "quiz", "flag", "jsapp"/*, "web", "docker"*/],
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
        minlength: 6
    },
    markdown: {
        type: String
    },
    lang: {
        type: String
    },
    image: {
        type: String
    },
    video: {
        type: String
    },
    files: [{
        folder: {
            type: String,
            required: true
        },
        files: [{
            filename: {
                type: String,
                required: true
            },
            code: {
                type: String,
                required: true
            },
            size: {
                type: Number,
                required: true
            }
        }]
    }],
    checks: [{
        stdin: String,
        stdout: String,

        code: String,
        output: String,
        multiline: Boolean,
        fail: Boolean,

        hint: String
    }],
    question: {
        type: String
    },
    answers: [{
        choice: String,
        correct: Boolean
    }],
    flag: {
        type: String
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }
    /*
    image: {
        type: String
    }
    */
});
sectionSchema.plugin(uniqueValidator);
export default mongoose.model('Section', sectionSchema);