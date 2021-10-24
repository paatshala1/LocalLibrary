const
    { Schema, model } = require('mongoose'),
    { DateTime } = require('luxon');


const BookInstanceSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
    imprint: {type: String, required: true},
    status: {
        type: String,
        required: true, 
        enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], 
        default: 'Available'},
    due_back: {type: Date, default: DateTime.now}
});

// Virtual for bookinstance's URL
BookInstanceSchema
.virtual('url')
.get(function(){
  return `/catalog/bookinstance/${this._id}`;
});

// Virtual for formated date
BookInstanceSchema
.virtual('due_back_formatted')
.get(function(){
  return DateTime.fromJSDate(this.due_back).plus({hours: 6}).toLocaleString(DateTime.DATE_MED);
});


//Export model
module.exports = model('BookInstance', BookInstanceSchema);
