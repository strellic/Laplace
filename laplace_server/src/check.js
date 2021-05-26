import RE2 from "re2";

import Room from "../models/Room.js";

import sandbox from "./sandbox.js";
import response from "./response.js";

const trimmer = /^\s+|\s+$/g;
const compare = (input1, input2) => {
	return input1 === input2 || input1.replace(trimmer, "") === input2.replace(trimmer, "");
}

const regexCompare = (regex, input, multiline = true, fail = false) => {
	let r = new RE2(regex);
	r.multiline = multiline;
	return (r.test(input) === !fail);
}

const complete = async (user, room, section) => {
	let index = user.completed.findIndex(entry => entry.room.code === room.code);
	if(index === -1) {
		index = user.completed.push({ room: room._id, sections: [] }) - 1;
	}
	if(!user.completed[index].sections.find(s => s.code === section.code)) {
		user.completed[index].sections.push(section._id);
		await user.save();
	}
}

const coding = (emit, user, room, section, lang, files) => {
	let checks = section.coding.checks;

	let testCases = checks.filter(c => c.stdin || c.stdout);
	let codeChecks = checks.filter(c => c.code || c.output);

	let stdins = testCases.map(c => c.stdin);
	if(stdins.length === 0)
		stdins = [""];

	let num = 0;
	let passed = true;
	let failed = 0;

	sandbox.runLang(lang, files, stdins, async (result) => {
		if(result.type !== "run")
			return;

		if(testCases[num]) {
			if(compare(result.stdout, testCases[num].stdout)) {
				emit({type: "stdout", msg: `[Task] Passed test case ${num + 1} / ${checks.length}.\n`});
			}
			else {
				passed = false;
				failed++;
				emit({type: "stderr", msg: `[Task] Failed test case ${num + 1} / ${checks.length}.\n`});
				if(testCases[num].hint)
					emit({type: "stderr", msg: `[Task]\t\t${testCases[num].hint}\n`});
			}

			num++;
		}

		if(num === testCases.length) {
			let code = files[0].files[0].content;
			for(let i = 0; i < codeChecks.length; i++) {
				let check = codeChecks[i];
				let okay = true;

				if(check.code) {
					if(!regexCompare(check.code, code || "", check.multiline, check.fail))
						okay = false;
				}
				if(check.output) {
					if(!regexCompare(check.output, result.stdout || "", check.multiline, check.fail))
						okay = false;
				}

				if(!okay) {
					passed = false;
					failed++;
					emit({type: "stderr", msg: `[Task] Failed check ${num + i + 1} / ${checks.length}.\n`});
					if(check.hint)
						emit({type: "stderr", msg: `[Task]\t\t${check.hint}\n`});
				}
				else {
					emit({type: "stdout", msg: `[Task] Passed check ${num + i + 1} / ${checks.length}.\n`});
				}
			}

			if(passed) {
				emit({type: "stdout", msg: "\nNice job! You passed all of the checks."});
				emit({type: "completed"});
				await complete(user, room, section);
			}
			else {
				emit({type: "stderr", msg: `\n${section.title} failed.\n${failed} / ${checks.length} checks failed.`});
			}
		}
	});
}

const verify = async ({ emit, res, user, room, section, token, lang, files, answer, answers, flag }) => {
	let find;
	if(user.enrolled.find(check => check.code === room)) {
		find = user.enrolled.find(check => check.code === room);
	}
	if(user.created.find(check => check.code === room)) {
		find = user.created.find(check => check.code === room);
	}

	let error = (msg) => {
		if(emit) 
			return emit({type: "stderr", msg});
		else
			return res.json(response.failure(msg));
	}
	let success = (msg) => {
		if(emit) 
			return emit({type: "stdout", msg});
		else
			return res.json(response.success(msg));
	}

	if(!find) {
		return error("You are not in that room.");
	}

	Room.findOne({ code: find.code }).populate("sections").exec(async (err, room) => {
		if(!room.sections.find(find => find.code === section)) {
			return error("That section does not exist.");
		}
		section = room.sections.find(find => find.code === section);

		if(section.type === "coding" && section.coding.checks.length > 0) {
			if(!lang || typeof lang !== 'string') {
				return error("Missing lang.");
			}
			if(!files || typeof files !== 'object') {
				return error("Missing files.");
			}
			return coding(emit, user, room, section, lang, files);
		}
		else if(section.type === "info"
            || (section.type === "coding" && section.coding.checks.length === 0)
            || section.type === "website") {
			await complete(user, room, section);
			return success("Section completed!");
		}
		else if(section.type === "quiz") {
            let correct = section.quiz.answers.filter(a => a.correct).map(a => a.choice);
			if(section.quiz.all) {
                if(JSON.stringify(correct.sort()) === JSON.stringify(answers.sort())) {
                    await complete(user, room, section);
                    return success("Section completed!");
                }
            }
            else {
                if((correct.length === 0 && !answer) 
                    || correct.includes(answer) ) {
                    await complete(user, room, section);
                    return success("Section completed!");
                }
            }
			return error("Incorrect answer!");
		}
		else if(section.type === "flag") {
			if(section.flag === flag) {
				await complete(user, room, section);
				return success("Section completed!");
			}
			return error("Incorrect answer!");
		}
		else {
			return error("Section type not implemented!");
		}
	});
}

export default { verify }