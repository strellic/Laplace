import React from "react";
import Cookies from 'universal-cookie';

function LogoutPage() {
  React.useEffect(() => {
    const cookies = new Cookies();
    cookies.remove("authToken");
  }, []);

  window.location = "/";

  return (
    <>
    </>
  );
}

export default LogoutPage;
