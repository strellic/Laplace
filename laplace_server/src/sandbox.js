import fs from "fs";
import { Worker } from 'worker_threads';

const runLang = async (lang, files, input=[""], callback) => {
	let executions = [];
	if(lang === "python") {
		executions.push({
			profile: "python_run",
			cmd: ["python3", "main.py"],
			files: files,
			stdins: input
		});
	}
	else if(lang === "node") {
		executions.push({
			profile: "node_run",
			cmd: ["node", "index.js"],
			files: files,
			stdins: input
		});
	}
	else if(lang === "java") {
		executions.push({
			profile: "java_compile",
			cmd: ["javac", "Main.java"],
			files: files
		});
		executions.push({
			profile: "java_run",
			cmd: ["java", "Main"],
			stdins: input
		});
	}
	else if(lang === "c") {
		executions.push({
			profile: "gcc_compile",
			cmd: ["gcc", "main.c", "-o", "main"],
			files: files
		});
		executions.push({
			profile: "gcc_run",
			cmd: ["./main"],
			stdins: input
		});
	}
	else if(lang === "c++") {
		executions.push({
			profile: "gcc_compile",
			cmd: ["g++", "-pipe", "-O2", "-static", "-o", "main", "main.cpp"],
			files: files
		});
		executions.push({
			profile: "gcc_run",
			cmd: ["./main"],
			stdins: input
		});
	}
	else if(lang === "c#") {
		executions.push({
			profile: "mono_compile",
			cmd: ["csc", "main.cs"],
			files: files
		});
		executions.push({
			profile: "mono_run",
			cmd: ["mono", "main.exe"],
			stdins: input
		});
	}
	else if(lang === "rust") {
		executions.push({
			profile: "rust_compile",
			cmd: ["rustc", "main.rs", "-o", "main"],
			files: files
		});
		executions.push({
			profile: "rust_run",
			cmd: ["./main"],
			stdins: input
		});
	}
	else {
		return callback({ exit_code: 1, stderr: "Invalid language." });
	}

	let worker = new Worker('./src/sandbox_worker.js', { workerData: executions });
	worker.on('message', (data) => {
		callback(data);
	});
};

const settings = {
	langs: [
		{
			lang: "python",
			template: [
				{
					folder: "/",
					files: [{filename: "main.py", content: fs.readFileSync("src/templates/python/main.py").toString()}]
				}
			],
			name: "Python 3.8.5"
		},
		{ 
			lang: "node",
			template: [
				{
					folder: "/",
					files: [
						{filename: "index.js", content: fs.readFileSync("src/templates/node/index.js").toString()},
						{filename: "input.js", content: fs.readFileSync("src/templates/node/input.js").toString()},
					]
				}
			],
			name: "NodeJS 10.13.0"
		}, 
		{ 
			lang: "java",
			template: [
				{
					folder: "/",
					files: [{filename: "Main.java", content: fs.readFileSync("src/templates/java/Main.java").toString()}]
				}
			],
			name: "Java 11"
		},
		{ 
			lang: "c",
			template: [
				{
					folder: "/",
					files: [{filename: "main.c", content: fs.readFileSync("src/templates/c/main.c").toString()}]
				}
			],
			name: "C"
		},
		{ 
			lang: "c++",
			template: [
				{
					folder: "/",
					files: [{filename: "main.cpp", content: fs.readFileSync("src/templates/c++/main.cpp").toString()}]
				}
			],
			name: "C++"
		},
		{ 
			lang: "c#",
			template: [
				{
					folder: "/",
					files: [{filename: "main.cs", content: fs.readFileSync("src/templates/c#/main.cs").toString()}]
				}
			],
			name: "C#"
		},
		{ 
			lang: "rust",
			template: [
				{
					folder: "/",
					files: [{filename: "main.rs", content: fs.readFileSync("src/templates/rust/main.rs").toString()}]
				}
			],
			name: "Rust"
		}
	],
	profiles: {
		gcc_compile: {
			image: 'stepik/epicbox-gcc:6.3.0',
			user: 'root',
			limits: {cputime: 3, memory: 128},
			type: "compile"
		},
		gcc_run: {
			image: 'stepik/epicbox-gcc:6.3.0',
			user: 'sandbox',
			limits: {cputime: 1, memory: 64},
			type: "run"
		},
		mono_compile: {
			image: 'stepik/epicbox-mono:5.0.0',
			user: 'root',
			limits: {cputime: 3, memory: 128},
			type: "compile"
		},
		mono_run: {
			image: 'stepik/epicbox-mono:5.0.0',
			user: 'sandbox',
			limits: {cputime: 1, memory: 64},
			type: "run"
		},
		java_compile: {
			image: 'stepik/epicbox-java:11.0.1',
			user: 'root',
			limits: {cputime: 5, memory: 128},
			type: "compile"
		},
		java_run: {
			image: 'stepik/epicbox-java:11.0.1',
			user: 'sandbox',
			limits: {cputime: 1, memory: 64},
			type: "run"
		},
		node_run: {
			image: 'strellic/epicbox-node:latest',
			user: 'sandbox',
			limits: {cputime: 1, memory: 64},
			type: "run"
		},
		python_run: {
			image: 'strellic/epicbox-python:latest',
			user: 'sandbox',
			limits: {cputime: 1, memory: 64},
			type: "run"
		},
		rust_compile: {
			image: 'strellic/rust-sandbox:latest',
			user: 'sandbox',
			limits: {cputime: 3, memory: 128},
			type: "compile"
		},
		rust_run: {
			image: 'strellic/rust-sandbox:latest',
			user: 'sandbox',
			limits: {cputime: 1, memory: 64},
			type: "run"
		}
	},
	CPU_TO_REAL_TIME_FACTOR: 2
};

export default { settings, runLang }