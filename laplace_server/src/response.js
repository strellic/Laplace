function success(response) {
	return {
		success: true,
		response: sanitize(response)
	}
}

function failure(response) {
	return {
		success: false,
		response: sanitize(response)
	}
}

const MONGOID_REGEX = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

function sanitize(obj, keys = [], n = 0) {
	if(n > 10)
		return;

	obj = JSON.parse(JSON.stringify(obj));

	keys = [...keys, "__v", "_id", "password"];

	for(let key in obj) {
		if(keys.includes(key)) {
			obj[key] = null;
		}
		else if(obj[key] && typeof obj[key] === "string" && MONGOID_REGEX.test(obj[key])) {
			obj[key] = null;
		}
		else if(obj[key] && typeof obj[key] === "object") {
			obj[key] = sanitize(obj[key], keys, n+1);
		}
	}
	return JSON.parse(JSON.stringify(obj, (k, v) => {
  		if (v !== null) return v
	}));
}

export default { success, failure, sanitize }