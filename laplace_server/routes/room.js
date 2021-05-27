import { v4 as uuidv4 } from 'uuid';
import express from "express";
import Ajv from 'ajv'
import fs from "fs";

import Section from "../models/Section.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

import authenticate from "../src/authenticate.js";
import response from "../src/response.js";
import check from "../src/check.js";

const router = express.Router();

const ajv = new Ajv.default({
  allErrors: true,
});

const SECTION_TYPES = ["info", "coding", "quiz", "flag", "website"];

const FILE_SCHEMA = {
    "additionalProperties": false,
    "required": [ "filename", "code", "size" ],
    "type": "object",
    "properties": {
        "filename": { "type": "string" },
        "code": { "type": "string" },
        "size": { "type": "number" }
    }
};

const STORAGE_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [ "folder", "files" ],
        "properties": {
            "folder": { "type": "string" },
            "files": {
                "type": "array",
                "items": FILE_SCHEMA
            }
        }
    }
};

const ROOM_SCHEMA = {
    "type": "object",
    "title": "Room",
    "required": ["title", "desc"],
    "properties": {
        "title": { "type": "string", "minLength": 3, "maxLength": 30 },
        "desc": { "type": "string", "minLength": 3, "maxLength": 280 },
        // "code" property not allowed for rooms
        "sections": {
            "type": "array",
            "items": {
                "additionalProperties": false,
                "required": [ "title", "type" ],
                "type": "object",
                "properties": {
                    "title": { "type": "string", "minLength": 3, "maxLength": 30 },
                    "type": { "enum": SECTION_TYPES },
                    "layout": { "type": "number" },
                    
                    "code": { "type": "string" },
                    "markdown": { "type": "string" },
                    "lang": { "type": "string" },


                    "info": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                            "image": FILE_SCHEMA
                        }
                    },

                    "coding": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                            "lang": { "type": "string" },
                            "files": STORAGE_SCHEMA,
                            "checks": {
                                "type": "array",
                                "items": {
                                    "additionalProperties": false,
                                    "type": "object",
                                    "properties": {
                                        // code fd checks
                                        "stdin": { "type": "string" },
                                        "stdout": { "type": "string" },
                                        // code regex/style checks
                                        "code": { "type": "string" },
                                        "output": { "type": "string" },
                                        "multiline": { "type": "boolean" },
                                        "fail": { "type": "boolean" },
                                        // hint on test case fail
                                        "hint": { "type": "string" }
                                    }
                                }
                            }
                        }
                    },

                    "quiz": {
                        "type": "object",
                        "additionalProperties": false,
                        "required": [ "question" ],
                        "properties": {
                            "question": { "type": "string" },
                            "answers": { 
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "required": ["choice", "correct"],
                                    "additionalProperties": false,
                                    "properties": {
                                        "choice": { "type": "string"},
                                        "correct": { "type": "boolean"}
                                    }
                                }
                            },
                            // whether all answers that are correct are required
                            "all": { "type": "boolean" },
                        }
                    },

                    "flag": { "type": "string" },

                    "website": {
                        "type": "object",
                        "required": ["url"],
                        "additionalProperties": false,
                        "properties": {
                            "url": { 
                                "type": "string",
                                "pattern": "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$"
                            },
                            "autopass": { "type": "boolean" }
                        }
                    }
                }
            }
        },
        "public": { "type": "boolean" }
    },
    "additionalProperties": false
};

router.get("/count", async (req, res) => {
    let rooms = await Room.find({});
    return res.json(response.success({
        count: rooms.length
    }));
});

router.post("/create", authenticate.requiresLogin, async (req, res) => {
    let roomData = req.body.roomData;
    let result = ajv.validate(ROOM_SCHEMA, roomData);

    if(!result) {
        return res.json(response.failure("There was an error processing the data: " + ajv.errorsText()));
    }

    try {
        let user = await authenticate.getUser({username: req.jwt.username}, ["rooms"]);
        let room = new Room({
            title: roomData.title,
            desc: roomData.desc,
            code: uuidv4(),
            author: user,
            public: roomData.public
        });

        let sections = [];
        for(let i = 0; i < roomData.sections.length; i++) {
            let section = new Section(roomData.sections[i]);
            section.code = uuidv4();
            section.room = room;
            await section.save();
            sections.push(section);
        }

        room.sections = sections;
        await room.save();

        user.created.push(room);
        await user.save();

        return res.json(response.success("Room created successfully."));
    }
    catch(err) {
        console.log(err);
        return res.json(response.failure("There was an error saving your room. Please try again."));
    }
});

router.post("/edit", authenticate.requiresLogin, async (req, res) => {
    let roomData = req.body.roomData;

    let result = ajv.validate(ROOM_SCHEMA, roomData);
    if(!result) {
        return res.json(response.failure("There was an error processing the data: " + ajv.errorsText()));
    }

    let code = req.body.code;
    let user = await authenticate.getUser({username: req.jwt.username}, ["rooms"]);

    let check = user.created.find(check => check.code === code);
    if(!check) {
        return res.json(response.failure("You do not have a room with that code."));
    }

    Room.findById(check._id).populate("sections").exec(async (err, room) => {
        room.title = roomData.title;
        room.desc = roomData.desc;

        let sections = [];
        for(let i = 0; i < roomData.sections.length; i++) {
            let sectionData = roomData.sections[i];
            if(sectionData.code && room.sections.find(section => section.code === sectionData.code)) {
                let section = await Section.findByIdAndUpdate(room.sections.find(section => section.code === sectionData.code)._id, sectionData, { overwrite: true, new: true });
                sections.push(section);
            }
            else {
                let section = new Section(sectionData);
                section.code = uuidv4();
                section.room = room;    
                sections.push(section);
                await section.save();
            }
        }

        let remove = {
            ids: [],
            codes: []
        };
        for(let i = 0; i < room.sections.length; i++) {
            if(!sections.find(section => section.code === room.sections[i].code)) {
                remove.ids.push(room.sections[i]._id);
                remove.codes.push(room.sections[i].code);
            }
        }

        room.sections = sections;
        room.public = roomData.public;
        await room.save();

        if(remove.ids.length > 0) {
            let members = [...room.members, room.author];
            for(let i = 0; i < members.length; i++) {
                let user = await authenticate.getUser({_id: members[i]}, ["rooms"]);
                for(let j = 0; j < user.completed.length; j++) {
                    if(user.completed[j].room.code === room.code) {
                        user.completed[j].sections = user.completed[j].sections.filter(sec => !remove.codes.includes(sec.code));
                        await user.save();
                    }
                }
            }
        }

        await Section.deleteMany({_id: {$in: remove.ids}});
        return res.json(response.success("Room updated successfully."));
    });
});

router.post("/delete", authenticate.requiresLogin, async (req, res) => {
    let code = req.body.code;
    let user = await authenticate.getUser({username: req.jwt.username}, ["rooms"]);

    let check = user.created.find(check => check.code === code);
    if(!check) {
        return res.json(response.failure("You do not have a room with that code."));
    }

    Room.findById(check._id).populate("sections").populate("members").populate("author").exec(async (err, room) => {
        let members = [...new Set([...room.members, room.author])];

        for(let i = 0; i < members.length; i++) {
            let member = await authenticate.getUser({_id: members[i]._id}, ["rooms"]);
            member.enrolled = member.enrolled.filter(e => e.code !== room.code);
            member.created = member.created.filter(c => c.code !== room.code);
            member.completed = member.completed.filter(c => c.room?.code !== room.code);
            await member.save();
        }
        
        for(let i = 0; i < room.sections.length; i++) {
            await room.sections[i].delete();
        }
        await room.delete();

        return res.json(response.success("Room deleted successfully."));
    });
});

router.post("/info", authenticate.requiresLogin, async (req, res) => {
    let code = req.body.code;
    if (!code || typeof code !== 'string') {
        return res.json(response.failure("Missing code."));
    }

    let user = await authenticate.getUser({username: req.jwt.username}, ["rooms"]);

    Room.findOne({ code })
    .populate("sections")
    .populate({path: "members", populate: {path: "completed", populate: {path: "room sections" }}})
    .populate("author").exec((err, room) => {
        if(err || !room) {
            return res.json(response.failure("Unable to find room."));
        }

        let clone = response.sanitize(room);

        clone.author = clone.author.username;

        let completed = user.completed.find(c => c.room.code === room.code);

        for(let i = 0; i < clone.sections.length; i++) {
            if(completed && completed.sections.find(s => s.code === clone.sections[i].code))
                clone.sections[i].completed = true;
            else
                clone.sections[i].completed = false;        
        }

        if(user.username !== clone.author) {
            clone.sections = response.sanitize(clone.sections, ["flag"]);
            for(let i = 0; i < clone.sections.length; i++) {
                if(clone.sections[i].type === "coding")
                    clone.sections[i].coding.checks = clone.sections[i].coding.checks.map(c => true); 
                if(clone.sections[i].type === "quiz") {
                    clone.sections[i].quiz.answers = clone.sections[i].quiz.answers.map(answer => ({choice: answer.choice}));
                }
            }
            delete clone.members;
        }
        else {
            clone.members = clone.members.map(m => ({
                username: m.username,
                completed: m.completed.filter(c => c.room.code === code)[0]?.sections.map(s => s.code)
            }));
        }

        clone.sections = response.sanitize(clone.sections, ["room"]);
        for(let i = 0; i < clone.sections.length; i++) {
            for(let type of SECTION_TYPES.filter(t => t !== clone.sections[i].type))
                delete clone.sections[i][type]; 
        }

        return res.json(response.success(clone));
    });
});

router.post("/complete", authenticate.requiresLogin, async (req, res) => {
    if(!req.body.room || typeof req.body.room !== 'string') {
        return res.json(response.failure("Missing room."));
    }
    if(!req.body.section || typeof req.body.section !== 'string') {
        return res.json(response.failure("Missing section."));
    }

    let user = await authenticate.getUser({username: req.jwt.username}, ["rooms"]);
    await check.verify({user: user, res, ...req.body});
});

router.post("/join", authenticate.requiresLogin, async (req, res) => {
    if(!req.body.code || typeof req.body.code !== 'string') {
        return res.json(response.failure("Missing room."));
    }

    let code = req.body.code;
    let user = await authenticate.getUser({username: req.jwt.username}, ["rooms"]);

    if(user.enrolled.find(r => r.code === code) || user.created.find(r => r.code === code)) {
        return res.json(response.failure("You are already in that room."));
    }

    Room.findOne({ code }, (err, room) => {
        if(err || !room) {
            return res.json(response.failure("Unable to find room."));
        }

        user.enrolled.push(room);
        room.members.push(user);
        room.save();
        user.save();

        return res.json(response.success("You have successfully joined the room."));
    });
});

router.get("/list", async (req, res) => {
    Room.find({ public: true }).populate("author").exec((err, docs) => {
        if(err) {
            return res.json(response.failure("Unable to list public rooms."));
        }
        let rooms = docs.map(r => ({ code: r.code, title: r.title, desc: r.desc, author: r.author.username }));
        return res.json(response.success(rooms));
    });
});

export default router;