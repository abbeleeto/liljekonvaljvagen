const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./../config/config').get(process.env.NODE_ENV);
const SALT_I = 10;

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        maxlength: 100,
        minlength: 2,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        maxlength: 100,
        minlength: 2,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: Number,
        default: 2
    },
    token: {
        type: String,
        require: true // FIXA
    },
    isAdmin: {
        type: Boolean
    }
});

userSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(SALT_I, (err, salt) => {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err);
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

userSchema.methods.generateToken = function(cb) {
    const user = this;

    var token = jwt.sign(user._id.toHexString(), config.SECRET);
    user.token = token;
    user.save((err, user) => {
        if(err){ return cb(err); }

        cb(null, user);
    });
}

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if(err) return cb(err);

        return cb(null, isMatch);
    });
}

userSchema.statics.findByToken = function(token, cb) {
    const user = this;

    jwt.verify(token, config.SECRET, (err, decode) => {
        user.findOne({'_id': decode, 'token': token}, (err, usr) => {
            if(err) return cb(err);

            cb(null, usr);
        })
    });
}

userSchema.methods.deleteToken = function(token, cb) {
    const user = this;

    user.update({
        $unset: {token: 1}
    }, (err, user) => {
        if(err) return cb(err);

        cb(null, user);
    });
}

const User = mongoose.model('User', userSchema);

module.exports = {User};