const { Schema, model } = require('mongoose');


const GenreSchema = new Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength:100,
        required: true
        // enum: ['Fiction', 'History', 'History Novel', 'Romance']
    }
});

GenreSchema
.virtual('url')
.get(function(){
    return `/catalog/genre/${this.id}`
})



module.exports = model('Genre', GenreSchema);
