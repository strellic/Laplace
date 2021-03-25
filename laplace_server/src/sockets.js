import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import validator from "validator";

import check from "./check.js";
import sandbox from "./sandbox.js";
import authenticate from "./authenticate.js";

import User from "../models/User.js";

const collabRooms = {};

const configure = wss => {
	wss.on("connection", ws => {
		const id = uuidv4();
		let room = null;

		const emit = (data, toSelf = true) => {
			let sent = false;
			if(collabRooms[room] && collabRooms[room][id] === ws) {
				data.count = Object.entries(collabRooms[room]).length;
				sent = true;
				for(let uuid of Object.keys(collabRooms[room])) {
					if(id == uuid && !toSelf)
						continue;

					collabRooms[room][uuid].send(JSON.stringify(data));
				}
			}
			if(!sent) {
				ws.send(JSON.stringify(data));
			}
		} 

		const leave = () => {
			if(!room || !collabRooms[room] || !collabRooms[room][id])
				return

		    if(Object.keys(collabRooms[room]).length === 1) 
		    	delete collabRooms[room];
		    else
		    	delete collabRooms[room][id];
		   	room = null;
		};

		ws.on('message', (message) => {
		    let data = JSON.parse(message);
		    console.log(data);
		    if(!data.type)
		    	return;

		    if(data.type === "ping") {
		    	emit({type: "pong", msg: new Date()});
		    }
		    else if(data.type === "run") {
		    	let { files, lang, input } = data;
				if(!files || typeof files !== 'object') {
					return emit({type: "stderr", msg: "Missing files."});
				}
				if(!lang || typeof lang !== 'string') {
					return emit({type: "stderr", msg: "Missing language."});
				}

				let stdin = [""];
				if(input && typeof input === 'string') {
					stdin =	[input];
				}

				emit({type: "pending"});
				sandbox.runLang(lang, files, stdin, (result) => {
					console.log(result);
					if(result.stderr) {
						if(result.type === 'compile')
							emit({type: "stderr", msg: "There was an error compiling your code.\n\n"});
	                	else
	                		emit({type: "stderr", msg: "There was an error running your code.\n\n"});
	                	emit({type: "stderr", msg: result.stderr});
					}

					if(result.type === 'compile')
						return;

					if(result.stdout)
						emit({type: "stdout", msg: result.stdout});

					if(result.exit_code === 0) {
						emit({type: "stdout", msg: `\n-------------------------\n\nThe program executed successfully.\nDuration: ${result.duration}s\n\n\n`});
					}
					else {
						emit({type: "stderr", msg: `\n-------------------------\n\nThe program failed to run.\nDuration: ${result.duration}s\nTimeout: ${result.timeout}\nOut of Memory: ${result.oom_killed}\n\n\n`});
					}
				});
		    }
		    else if(data.type === "check") {
		    	if(!data.room || typeof data.room !== 'string') {
					return emit({type: "stderr", msg: "Missing room."});
				}
				if(!data.section || typeof data.section !== 'string') {
					return emit({type: "stderr", msg: "Missing section."});
				}
				if(!data.token || typeof data.token !== 'string') {
					return emit({type: "stderr", msg: "Missing token."});
				}

				let decoded = authenticate.decode(data.token);
				if(!decoded || !decoded.isSignedIn || !decoded.username)
					return emit({type: "stderr", msg: "Invalid token."});

				authenticate.getUser({username: decoded.username}, ["rooms"], (err, user) => {
					if (err || !user) {
		                return emit({type: "stderr", msg: "No user found."});
		            }

		            emit({type: "pending"});
		            check.verify({...data, emit, user});
				});
		    }
		    else if(data.type === "collab") {
		    	if(data.meta === "create") {
		    		let code = uuidv4();
		    		collabRooms[code] = {};
		    		collabRooms[code][id] = ws;
		    		room = code;
		    		return emit({type: "collab", meta: "create", msg: code});
		    	}

		    	if(data.meta === "join") {
		    		if(!data.code)
		    			return emit({type: "collab", meta: "error", msg: "Missing collab room code."});
			    	if(!validator.isUUID(data.code) || !collabRooms[data.code])
			    		return emit({type: "collab", meta: "error", msg: "Invalid collab room code."});
			    	if(room) {
			    		leave();
			    	}
			    	if(!collabRooms[data.code][id]) {
			    		room = data.code;
			    		collabRooms[data.code][id] = ws;
			    		emit({ type: "collab", meta: "please_update" }, false);
			    	}
		    	}
		    	else if(data.meta === "leave") {
		    		leave();
		    	}
		    	else if(data.meta === "update" && room && data.msg) {
		    		emit({ type: "collab", meta: "update", msg: data.msg, count: Object.entries(collabRooms[room]).length }, false);
		    	}
		    }
		});

		ws.on('close', () => {
			leave();
		});
	});
};
export default { configure }