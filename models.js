const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    }
});

UserSchema.methods.apiRepr = function() {
    return {
        username: this.username || '',
        email: this.email || ''
    };
}

UserSchema.methods.validatePassword = function(password) {
    return bcrypt
        .compare(password, this.password)
        .then(isValid => isValid);
}

UserSchema.statics.hashPassword = function(password) {
    return bcrypt
        .hash(password, 10)
        .then(hash => hash);
}

const User = mongoose.model('User', UserSchema);

module.exports = {User};









