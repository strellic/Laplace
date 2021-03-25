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
  	fetch(process.env.REACT_APP_API_URL + "/api/user/auth", {
   		method: "POST"
	  })
    .then(resp => resp.json())
    .then(json => {
		  if(json.success) {
			  setState({status: 'success', error: null, data: {
          isSignedIn: true,
          user: json.response.username,
          email: json.response.email
        }});
      }
      else {
        setState({status: 'error', error: json.response, data: {
          isSignedIn: false
        }});
      }
    });
  }, [])

  return (
    <AuthContext.Provider value={state}>
      {state.status === 'pending' ? (<div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)'
        }}>
          <Spinner color="info" style={{ width: '8rem', height: '8rem' }} />
        </div>)
        :
        children
      }
    </AuthContext.Provider>
  )
}

function useAuthState() {
  const state = React.useContext(AuthContext);
  const cookies = new Cookies();
  return {
    status: state.status,
    token: cookies.get("authToken"),
    ...state.data
  }
}

export { AuthProvider, useAuthState };