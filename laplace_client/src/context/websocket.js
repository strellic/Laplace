import React from 'react';

const WSContext = React.createContext();
function WSProvider({children}) {
	const [status, setStatus] = React.useState("disconnected");
	const [ws, setWS] = React.useState(null);

	const connectWS = () => {
		let ws = new WebSocket(process.env.REACT_APP_API_URL.replace("https", "wss").replace("http", "ws") + "/api/ws");
	  ws.onopen = () => {
	    if(status === "disconnected")
	      setStatus("connected");
	  }
	  ws.onclose = () => {
	    setStatus("disconnected");
	  }
	  setWS(ws);
	}

	React.useEffect(() => {
  	connectWS();
  }, []);

	let state = {
		status,
		setStatus,
		ws,
		setWS,
		connectWS
	}

	return (
	  <WSContext.Provider value={state}>
	    {children}
	  </WSContext.Provider>
	);
}

function useWSState() {
  return React.useContext(WSContext);
}

export { WSProvider, useWSState };