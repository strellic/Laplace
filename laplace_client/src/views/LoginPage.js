import React from "react";
import { useHistory } from "react-router-dom";
// reactstrap components
import {
  Container,
  Col
} from "reactstrap";

// core components
import Navbar from "components/Navbars/Navbar.js";
import TransparentFooter from "components/Footers/TransparentFooter.js";

import Login from "components/Form/Login.js";

import { useAuthState } from "context/auth.js";

function LoginPage() {
  const { isSignedIn } = useAuthState();
  const history = useHistory();

  React.useEffect(() => {
    document.body.classList.add("login-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    return function cleanup() {
      document.body.classList.remove("login-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  if(isSignedIn) {
    history.push("/home");
    return <></>;
  }

  return (
    <>
      <Navbar />
      <div className="page-header clear-filter" filter-color="blue">
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/login.jpg") + ")",
          }}
        ></div>
        <div className="content">
          <Container>
            <Col className="ml-auto mr-auto" md="4">
              <Login />
            </Col>
          </Container>
        </div>
        <TransparentFooter />
      </div>
    </>
  );
}

export default LoginPage;
