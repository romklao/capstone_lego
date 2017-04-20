const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const FavoriteSetSchema = mongoose.Schema({
    set_num: {type: String, required: true}
    // name: {type: String, required: true}
});

FavoriteSetSchema.methods.apiRepr = function() {
    return {
        id: this._id || '',
        set_num: this.set_num || '',
        created: this.created || ''
    };
}

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
    },
    favorites: [ FavoriteSetSchema ]
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

const FavoriteSet = mongoose.model('FavoriteSet', FavoriteSetSchema); 

const User = mongoose.model('User', UserSchema);

module.exports = {User, FavoriteSet};









