import mongoose from 'mongoose';

const Schema = mongoose.Schema;
import uniqueValidator from 'mongoose-unique-validator';

const FILE_SCHEMA = {
    filename: {
        type: String
    },
    code: {
        type: String
    },
    size: {
        type: Number
    }
};

const STORAGE_SCHEMA = [{
    required: false,
    folder: {
        type: String,
    },
    files: [FILE_SCHEMA]
}];

const sectionSchema = Schema({
    title: {
        type: String,
        required: true,
        maxlength: 30
    },
    type: {
        type: String,
        enum: ["info", "coding", "quiz", "flag", "website"/*, "web", "docker"*/],
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
    layout: {
        type: Number,
        default: 0
    },

    // start of type-specific section data
    info: {
        image: FILE_SCHEMA,
        required: false
    },

    coding: {
        lang: {
            type: String
        },
        files: STORAGE_SCHEMA,
        checks: [{
            stdin: String,
            stdout: String,

            code: String,
            output: String,
            multiline: Boolean,
            fail: Boolean,

            hint: String
        }],
        required: false
    },

    quiz: {
        question: {
            type: String,
        },
        answers: [{
            choice: {
                type: String,
            },
            correct: {
                type: Boolean,
            }
        }],
        all: {
            type: Boolean,
            default: false
        },
        required: false
    },

    flag: {
        type: String,
        required: false
    },

    website: {
        url: {
            type: String
        },
        autopass: {
            type: Boolean,
            default: true
        },
        required: false
    },

    // end of type-specific section data

    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }

});
sectionSchema.plugin(uniqueValidator);
export default mongoose.model('Section', sectionSchema);