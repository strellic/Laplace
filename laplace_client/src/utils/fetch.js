import Cookies from 'universal-cookie';

export default function(url, options = {}) {
	const cookies = new Cookies();

	if(!options.headers) {
		options.headers = {};
	}

	if(options.body) {
		try {
			JSON.parse(options.body);
			options.headers["Content-Type"] = "application/json";
		}
		catch {}
	}

	if(typeof window !== 'undefined' && (!options.headers.Authorization && !options.noToken)) {
		if(cookies.get("authToken"))
			options.headers.Authorization = cookies.get("authToken");
	}

	return fetch(url, options);
}