import React from "react";
import Cookies from 'universal-cookie';

import { useHistory } from "react-router-dom";

function LogoutPage() {
  const history = useHistory();

  React.useEffect(() => {
    const cookies = new Cookies();
    cookies.remove("authToken");
    history.push("/");
  }, [history]);

  return <></>;
}

export default LogoutPage;
