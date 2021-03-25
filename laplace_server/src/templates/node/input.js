const fs = require('fs');
let data;
module.exports = (q) => {
    if(q) {
        process.stdout.write(q);
    }
  	if(!data) {
		data = fs.readFileSync('/dev/stdin').toString().split("\n");
  	}
  	let next = data.shift();
  	if(!next) {
    	throw new Error("EOFError: No more lines of input.");
    }
    return next;
}