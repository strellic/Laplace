import express from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import passport from "passport";

import User from "../models/User.js";
import File from "../models/File.js";
import authenticate from "../src/authenticate.js";

import response from "../src/response.js";

const router = express.Router();

router.get("/count", async (req, res) => {
    let users = await User.find({});
    return res.json(response.success({
        count: users.length
    }));
});

router.get("/list", async (req, res) => {
    let users = await User.find({});

    let data = [];
    for(let i = 0; i < users.length; i++) {
        data.push({
            username: users[i].username,
        });
    }

    return res.json(response.success(data));
});

router.get("/info", async (req, res) => {
    let username = req.query.username;
    if (typeof username !== 'string' || username.length < 6) {
        return res.json(response.failure("Username must be 6 characters at minimum."));
    }

    let user = await authenticate.getUser({ username }, ["rooms"]);
    if(!user) {
        return res.json(response.failure("No user found with that username."));
    }

    return res.json(response.success({
        username: user.username,
        name: user.name || "",
        bio: user.bio || "",
        enrolled: user.enrolled.length, 
        created: user.created.length,
        completed: user.completed.length,
        profilepic: user.profilepic
    }));
});

router.post("/update_info", authenticate.requiresLogin, async (req, res) => {
    let email = req.body.email;
    let name = req.body.name;
    let username = req.body.username;

    let user = req.user;

    if (user.username !== username) {
        if(username.length < 6) {
            return res.json(response.failure("Username must be 6 characters at minimum."));
        }

        if(await authenticate.getUser({username})) {
            return res.json(response.failure("A user already exists with that username."));
        }

        user.username = username;
    }

    if (user.name !== name) {
        user.name = name;
    }
        
    if (user.email !== email) {
        if(!validator.isEmail(email)) {
            return res.json(response.failure("Invalid email address."));
        }
        user.email = email;
    }

    user.save();

    return res.json(response.success(authenticate.sign(user)));
});

router.post("/update_pass", authenticate.requiresLogin, async (req, res) => {
    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) {
        return res.json(response.failure("Password must be 8 characters at minimum."));
    }

    let user = req.user;

    bcrypt.compare(currentPassword, user.password, (err, result) => {
        if (err || !result) {
            return res.json(response.failure("Incorrect password."));
        }
            
        bcrypt.hash(newPassword, 12, (err, hash) => {
            if(err) {
                return res.json(response.failure("There was an error changing your password."));
            }

            user.password = hash;
            user.save();

            return res.json(response.success("Password changed successfully."));
        });
    });
});

router.post("/update_bio", authenticate.requiresLogin, async (req, res) => {
    let bio = req.body.bio;
    let user = req.user;

    user.bio = bio;
    user.save();

    return res.json(response.success("Bio changed successfully."));
});

router.post("/update_pic", authenticate.requiresLogin, async (req, res) => {
    let code = req.body.code;
    let user = req.user;

    if(!code) {
        user.profilepic = null;
        user.save();
        return res.json(response.success("Profile picture removed."));
    }

    File.count({code}, (err, count) => {
        if(err || count === 0) {
            return res.json(response.success("That file was not found."));
        }
        user.profilepic = code;
        user.save();
        return res.json(response.success("Profile picture changed successfully."));
    });
});

router.post("/register", async (req, res, next) => {
    let username = req.body.username,
        password = req.body.password,
        email = req.body.email;

    if (typeof username !== 'string' || username.length < 6) {
        return res.json(response.failure("Username must be 6 characters at minimum."));
    }
    if (typeof password !== 'string' || password.length < 8) {
        return res.json(response.failure("Password must be 8 characters at minimum."));
    }
    if (typeof email !== 'string' || !validator.isEmail(email)) {
        return res.json(response.failure("Invalid email address."));
    }

    if(!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.json(response.failure("Username must consist of only letters, numbers, and underscores."));
    }

    bcrypt.hash(password, 12, (err, hash) => {
        if(err) {
            return res.json(response.failure("There was an error registering your account."));
        }

        let user = new User({username, password: hash, email});
        user.save((err) => {
            if(err) {
                console.log(err);
                return res.json(response.failure("A user already exists with that username or email."));
            }
            passport.authenticate('local', function(err, user, info) {
                return res.json(response.success(authenticate.sign(user)));
              })(req, res, next);
        });
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', function(err, user, info) {
        if (err) { 
            return res.json(response.failure("There was an error authenticate.signing in."));
        }
        if (!user) { 
            return res.json(response.failure("Incorrect username or password."));
        }
        return res.json(response.success(authenticate.sign(user)));
    })(req, res, next);
});

router.post("/auth", authenticate.requiresLogin, async (req, res) => {
    return res.json(response.success(req.jwt));
});

router.post("/rooms", authenticate.requiresLogin, async (req, res) => {
    let user = await authenticate.getUser({username: req.jwt.username}, ["rooms"]);
    return res.json(response.success({ 
        enrolled: user.enrolled, 
        created: user.created,
        completed: user.completed
    }));
});

router.post("/me", authenticate.requiresLogin, async (req, res) => {
    return res.json(response.success(req.user));
});

export default router;