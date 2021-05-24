import mongoose from 'mongoose';
import validator from 'validator';
import uniqueValidator from 'mongoose-unique-validator';

const Schema = mongoose.Schema;

const userSchema = Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
        validate: { validator: validator.isEmail, message: 'Invalid email.' }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
        minlength: 6
    },
    password: {
        type: String,
        required: true
    },
    enrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }],
    created: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }],
    completed: [{
        room: {
	        type: mongoose.Schema.Types.ObjectId,
	        ref: 'Room'
	    },
        sections: [{
        	type: mongoose.Schema.Types.ObjectId,
        	ref: 'Section'
    	}]
    }],
    name: {
        type: String,
        maxlength: 30
    },
    bio: {
        type: String,
        maxlength: 300
    },
    profilepic: {
        type: String
    },
    storage: [{
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
    }]
});

userSchema.plugin(uniqueValidator);

export default mongoose.model('User', userSchema);