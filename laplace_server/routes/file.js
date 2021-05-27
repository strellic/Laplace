import express from "express";
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import mime from 'mime';

import authenticate from "../src/authenticate.js";
import response from "../src/response.js";
import File from "../models/File.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/list", authenticate.requiresLogin, async (req, res) => {
    return res.json(response.success(req.user.storage));
});

router.post("/upload", [authenticate.requiresLogin, upload.single('file')], async (req, res) => {
    if(!req.file) {
        return res.json(response.failure("No file uploaded!"));
    }

    if(req.file.buffer.length > 8*1024*1024) {
        return res.json(response.failure("The file is too large."));
    }

    let folder = req.body.folder || "/";
    let total = 0;

    if(req.user.size + req.file.buffer.length > 128*1024*1024)
        return res.json(response.failure("You have hit the max storage cap of 128MB."));

    let code = uuidv4();
    File.create({
        filename: req.file.originalname.replace(/\//g, ""),
        data: req.file.buffer,
        mimetype: req.file.mimetype,
        code,
        size: req.file.buffer.length,
        owner: req.user
    }, async (err, item) => {
        if(err)
            return res.json(response.failure("There was an error uploading your file."));

        let location = req.user.storage.find(s => s.folder === folder);
        if(!location) {
            req.user.storage.push({folder, files: []});
            location = req.user.storage.find(s => s.folder === folder);
        }

        location.files.push({filename: item.filename, code: item.code, size: item.size});
        await req.user.save();

        return res.json(response.success("File uploaded successfully."));
    });
});

router.post("/update", authenticate.requiresLogin, async (req, res) => {
    if(!req.body.data || !Array.isArray(req.body.data)) {
        return res.json(resposne.failure("No data to update!"));
    }

    let total = 0;
    for(let folder of req.body.data) {
        if(!folder.folder || !folder.files || !Array.isArray(folder.files))
            return res.json(response.failure(`Incorrect update format.`));

        for(let file of folder.files) {
            total += file.content.length;
            if(file.content.length >= 8*1024*1024) {
                return res.json(response.failure(`The file ${file.filename} is too large. Saving aborted.`));
            }
        }
    }

    File.find({owner: req.user}, async (err, files) => {
        if(err)
            return res.json(response.failure("There was an error listing your files."));
        
        for(let i = 0; i < files.length; i++)
            total += files[i].size;

        if(total >= 128*1024*1024)
            return res.json(response.failure("You have hit the max storage cap of 128MB."));
    
        for(let folder of req.body.data) {
            if(!req.user.storage.find(s => s.folder === folder.folder)) {
                req.user.storage.push({folder: folder.folder, files: []});
            }
        }

        let deleteFiles = [];
        for(let folder of req.body.data) {
            let location = req.user.storage.find(s => s.folder === folder.folder);
            for(let file of folder.files) {
                let code = uuidv4();
                if(file.code && location.files.find(i => i.code === file.code)) {
                    code = file.code;
                    await File.deleteOne({owner: req.user, code: file.code});
                    location.files = location.files.filter(f => f.code !== file.code);
                }
                location.files.push({filename: file.filename, code: code, size: file.content.length});
                await File.create({
                    filename: file.filename,
                    data: Buffer.from(file.content),
                    mimetype: mime.getType(file.filename) || "text/plain",
                    code,
                    size: file.content.length,
                    owner: req.user
                });
            }
        }
        req.user.save();
        return res.json(response.success("Files saved successfully!"));
    });
});

router.post("/new_folder", authenticate.requiresLogin, async (req, res) => {
    if(!req.body.folder || typeof req.body.folder !== "string") {
        return res.json(response.failure("No folder name!"));
    }

    let folder = req.body.folder;

    if(!folder.startsWith("/"))
        folder = "/" + folder;

    let location = req.user.storage.find(s => s.folder === folder);
    if(!location) {
        req.user.storage.push({folder, files: []});
        await req.user.save();
    }

    return res.json(response.success("Folder created successfully."));
});

router.post("/delete", authenticate.requiresLogin, async (req, res) => {
    if(!req.body.code || typeof req.body.code !== "string") {
        return res.json(response.failure("No file code specified!"));
    }
    if(!req.body.folder || typeof req.body.folder !== "string") {
        return res.json(response.failure("No folder specified!"));
    }

    let location = req.user.storage.find(s => s.folder === req.body.folder);
    if(!location) {
        return res.json(response.failure("Bad folder specified!"));
    }
    let file = location.files.find(f => f.code === req.body.code);
    if(!file) {
        return res.json(response.failure("Bad file specified!"));
    }

    location.files = location.files.filter(f => f.code !== req.body.code);
    await req.user.save();

    File.deleteOne({owner: req.user, code: req.body.code}, (err) => {
        if(err)
            return res.json(response.failure("That file does not exist."));
        return res.json(response.success("File successfully deleted."));
    });
});

router.post("/del_folder", authenticate.requiresLogin, async (req, res) => {
    if(!req.body.folder || typeof req.body.folder !== "string") {
        return res.json(response.failure("No folder specified!"));
    }

    let folders = req.user.storage.filter(s => s.folder.startsWith(req.body.folder));
    let files = [];

    for(let folder of folders) {
        files = files.concat(folder.files.map(f => f.code));
    }

    File.deleteMany({owner: req.user, code: {$in: files}}, async (err) => {
        if(err)
            return res.json(response.failure("Unable to delete folder."));

        req.user.storage = req.user.storage.filter(s => !s.folder.startsWith(req.body.folder));
        await req.user.save();
        return res.json(response.success("Folder successfully deleted."));
    });
});

router.get("/:code", async (req, res) => {
    let { code } = req.params;
    if(!code || typeof code !== "string") {
        return res.json(response.failure("Invalid file."));
    }

    File.findOne({code}, (err, file) => {
        if(err || !file)
            return res.json(response.failure("Invalid file."));
        
        res.writeHead(200, {
            'Content-Disposition': `inline; filename="${encodeURIComponent(file.filename)}"`,
            'Content-Type': file.mimetype,
        });
        return res.end(file.data);
    });
});


export default router;