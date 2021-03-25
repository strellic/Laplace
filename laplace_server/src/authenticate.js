import passport from 'passport';
import local from 'passport-local';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

import response from "./response.js";

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new local.Strategy({
        session: false
    },
    async (username, password, done) => {
        User.findOne({
            username: username
        }, (err, user) => {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return done(err);
                }
                if (!result) {
                    return done(null, false);
                }
                return done(null, user);
            });
        });
    }
));

function decode(token) {
    let decoded = null;
    if (token) {
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (err) {
           decoded = null;
        }
    }
    return decoded;
}

function sign(user) {
    return jwt.sign({
        username: user.username,
        email: user.email,
        isSignedIn: true
    }, process.env.JWT_SECRET, {
        expiresIn: 86400
    });
}

function getUser(checks, populate = [], cb = () => {}) {
    return new Promise((resolve, reject) => {
        let fn = User.findOne(checks);
        if(populate.includes("rooms")) {
            fn.populate({
                path: "enrolled",
                populate: {
                    path: "sections"
                }
            })
            .populate({
                path: "created",
                populate: {
                    path: "sections"
                }
            })
            .populate({
                path: "completed",
                populate: {
                    path: "room sections"
                }
            })
        }
        fn.exec((err, user) => {
            if(cb)
                cb(err, user);
            if(err)
                reject(err);
            else 
                resolve(user);
        });
    });
}

function requiresLogin(req, res, next) {
    if (req.jwt && req.jwt.isSignedIn) {
        getUser({username: req.jwt.username}, [], (err, user) => {
            if (err || !user) {
                return res.json(response.failure("No user found!"));
            }
            req.user = user;
            next();
        });
    } 
    else {
        return res.json(response.failure("You are not signed in!"));
    }
}

export default {
    sign,
    decode,
    requiresLogin,
    getUser
};