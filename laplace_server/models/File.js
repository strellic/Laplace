import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const fileSchema = Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    filename: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    data: {
        type: Buffer
    },
    size: {
        type: Number,
        required: true
    }
});

export default mongoose.model('File', fileSchema);