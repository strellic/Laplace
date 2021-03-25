import Docker from 'dockerode';
import Stream from "stream";
import tar from 'tar-stream';
import streams from 'memory-streams';
import { workerData, parentPort } from 'worker_threads';

import sandbox from './sandbox.js';
const docker = new Docker();

let pack_files = (files) => {
	let pack = tar.pack();
	let entries = [];
	for(let location of files) {
		for(let file of location.files) {
			entries.push([{name: location.folder + file.filename}, file.content]);
		}
	}

	for(let entry of entries)
		pack.entry(entry[0], entry[1]);

	pack.finalize();

	return pack;
}

let run = (profile, cmd, files, stdins=[""], callback, container) => {
	return new Promise(async (resolve, reject) => {
		profile = sandbox.settings.profiles[profile];
		let timeout = profile.limits.timeout || profile.limits.cputime * sandbox.settings.CPU_TO_REAL_TIME_FACTOR;

		let execWrapper = async (container, cmd, stdins, timeout) => {
			for (let i = 0; i < stdins.length; i++) {
				console.time("exec");
				let result = await exec(container, cmd, stdins[i], timeout);
				console.timeEnd("exec");
				result.type = profile.type;

				if(result.stderr)
					result.exit_code = 1;

				callback({...result, type: profile.type});
			}
			resolve(container);
		};

		if(container) {
			execWrapper(container, cmd, stdins, timeout);
		}
		else {
			let tarfile = pack_files(files);

			let opts = {
				Image: profile.image,
				User: profile.user,
				WorkingDir: "/sandbox",
				HostConfig: {
					Memory: profile.limits.memory * 1000000,
					MemorySwap: profile.limits.memory * 1000000,
					PidsLimit: 1024,
					Ulimits: [
						{Name: "nofile", Soft: 1024, Hard: 2048},
						{Name: "cpu", Soft: profile.limits.cputime, Hard: profile.limits.cputime}
					],
					AutoRemove: true
				},
				Cmd: ["/bin/sh"], // fast opening program to not block container start
				OpenStdin: true,
			};

			console.time("create");
			docker.createContainer(opts, (err, container) => {
				console.timeEnd("create");
				console.time("put");
				container.putArchive(tarfile, {path: "/sandbox"}, (err) => {
					console.timeEnd("put");
					console.time("start");
					container.start(async (err, data) => {
						console.timeEnd("start");
						execWrapper(container, cmd, stdins, timeout);
					});
				});
			});
		}
	});
}

let exec = (container, cmd, stdin, timeout) => {
	return new Promise((resolve, reject) => {
		let output = new streams.WritableStream();
		let error = new streams.WritableStream();
		let results = {};

		let finished = false;

		container.exec({Cmd: cmd, AttachStdin: true, AttachStdout: true, AttachStderr: true, WorkingDir: "/sandbox"}, (err, exec) => {
			exec.start({hijack: true, stdin: true}, (err, stream) => {
				let start = new Date();

				let end = () => {
					results.stdout = output.toString();
					results.stderr = error.toString();

					if(!results.stderr && results.stdout && results.stdout.includes("error")) {
						results.stderr = results.stdout;
						results.stdout = "";
					}

					container.inspect((err, data) => {
						results.duration = (+(new Date() - start)/1000).toFixed(2);
						results.oom_killed = data.State.OOMKilled;
						resolve(results);
					});
				}

				setTimeout(() => {
					if(!finished) {
						finished = true;
						
						results.exit_code = 1;	
						results.timeout = true;
						end();
					}
				}, timeout * 1000);

				const finish = () => {
					if(!finished) {
						finished = true;

						results.exit_code = 0;
						results.timeout = false;
						end();
					}
				};

				const sender = new Stream.Readable();
				sender.push(stdin);
				sender.push(null);
				sender.pipe(stream);

				container.modem.demuxStream(stream, output, error);

				stream.on("end", finish);
			});
		});
	});
}

(async () => {
	let callback = (data) => {
		parentPort.postMessage(data);
	};
	let container;
	for(let i = 0; i < workerData.length; i++) {
		let { profile, cmd, files, stdins } = workerData[i];
		console.time("run");
		container = await run(profile, cmd, files, stdins, callback, container);
		console.timeEnd("run");
	}
	await container.remove({ force: true });
})();
