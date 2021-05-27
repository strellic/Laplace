import React from "react";
import { useAuthState } from "context/auth.js";

import AuthNavbar from "components/Navbars/AuthNavbar.js";
import IndexNavbar from "components/Navbars/IndexNavbar.js";

function Navbar(props) {
  const { isSignedIn } = useAuthState();

  if(isSignedIn) {
    return <AuthNavbar {...props} />;
  }
  return <IndexNavbar {...props} />;
}

export default Navbar;