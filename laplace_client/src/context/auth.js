import React from 'react';
import fetch from "utils/fetch.js";
import Cookies from 'universal-cookie';

import { Spinner } from 'reactstrap';

const AuthContext = React.createContext();
function AuthProvider({children}) {
  const [state, setState] = React.useState({
    status: 'pending',
    error: null,
    data: null,
  });

  React.useEffect(() => {
    let cookies = new Cookies();
    if(sessionStorage.auth) {
      try {
        let data = JSON.parse(sessionStorage.auth);
        if(data.time && data.time + 1000*60*15 > +new Date() && data.token === cookies.get("authToken")) {
          setState({status: 'success', error: null, data });
          return;
        }
        else {
          sessionStorage.removeItem("auth");
        }
      }
      catch(err) {}
    }

    fetch(process.env.REACT_APP_API_URL + "/user/auth", {
       method: "POST"
    })
    .then(resp => resp.json())
    .then(json => {
      if(json.success) {
        let data = {
          isSignedIn: true,
          user: json.response.username,
          email: json.response.email,
          time: +new Date(),
          token: cookies.get("authToken")
        };
        setState({status: 'success', error: null, data });
        sessionStorage.auth = JSON.stringify(data);
      }
      else {
        setState({status: 'error', error: json.response, data: {
          isSignedIn: false
        }});
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {state.status === 'pending' ? (
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <Spinner color="info" style={{ width: '8rem', height: '8rem' }} />
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}

function useAuthState(forceUpdate = false) {
  const state = React.useContext(AuthContext);
  const cookies = new Cookies();
  if(forceUpdate && sessionStorage.auth) {
    sessionStorage.removeItem("auth");
  }

  if(!cookies.get("authToken")) {
    return {
      status: "error",
      isSignedIn: false
    }
  }
  
  return {
    status: state.status,
    ...state.data
  }
}

export { AuthProvider, useAuthState };