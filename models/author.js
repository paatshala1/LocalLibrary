const
    { Schema, model } = require('mongoose'),
    { DateTime } = require('luxon');

const AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxlength: 100},
    family_name: {type: String, required: true, maxlength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
});


// Virtual fullname
AuthorSchema
.virtual('name').get(function(){
    return `${this.family_name}, ${this.first_name}`;
});


// Virtual url
AuthorSchema
.virtual('url').get(function(){
    return `/catalog/author/${this.id}`;
})


// Virtual lifespan
AuthorSchema
.virtual('lifespan').get(function(){
    var lifetime_string = '';
    if (this.date_of_birth) {
      lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    }
    lifetime_string += ' - ';
    if (this.date_of_death) {
      lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
    }
    return lifetime_string;
});
  


module.exports = model('Author', AuthorSchema);
