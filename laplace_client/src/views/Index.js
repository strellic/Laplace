import React from "react";

import { Container, Row, Col, Button } from "reactstrap";
import { Link } from "react-router-dom"; 

// core components
import Navbar from "components/Navbars/Navbar.js";
import IndexHeader from "components/Headers/IndexHeader.js";
import DarkFooter from "components/Footers/DarkFooter.js";

import SignUp from "components/Form/SignUp.js";

function Index() {
  React.useEffect(() => {
    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  });
  return (
    <>
      <Navbar />
      <div className="wrapper">
        <IndexHeader />
        <div className="main">
          <div className="section section-nucleo-icons">
            <Container>
              <Row>
                <Col lg="6" md="12">
                  <h2 className="title">Real-time Collaboration</h2>
                  <h5 className="description text-dark">
                    Laplace has built-in real-time collaboration, allowing you to share and edit your code with anyone! Find bugs in your code? Invite a teacher or a friend to help inspect and debug your code, in real-time.
                  </h5>
                </Col>
                <Col lg="6" md="12">
                  <div className="icons-container">
                    <img
                      alt="..."
                      src={require("assets/img/code-collab.svg")}
                    />
                  </div>
                </Col>
              </Row>
              <Row className="mt-5">
                <Col lg="5" md="11">
                  <div className="icons-container">
                    <img
                      alt="..."
                      src={require("assets/img/code-version-control.svg")}
                    />
                  </div>
                </Col>
                <Col lg="7" md="13">
                  <h2 className="title text-right">Custom Courses & Challenges</h2>
                  <h5 className="description text-right text-dark">
                    Laplace has support for teachers and content-creators to add custom courses & challenges that can be shared with their students. Using our built-in markdown editor and course creator, producting a coding curriculum is incredibly easy!
                  </h5>
                </Col>
              </Row>
            </Container>
          </div>
          <div className="section">
            <Container className="text-center">
              <Row className="justify-content-md-center">
                <Col lg="8" md="12">
                  <h2 className="title">Join Today</h2>
                  <h5 className="description text-dark">
                    Want to learn to code? No better day than today to start! Get the ability to code right in your browser and collaborate with others by signing up now!
                  </h5>
                </Col>
              </Row>
              <Button
                  className="btn-round mr-1"
                  color="info"
                  to="/register"
                  role="button"
                  size="lg"
                  tag={Link}
              >
                Register
              </Button>
              <Button
                  className="btn-round"
                  color="primary"
                  to="/login"
                  role="button"
                  size="lg"
                  tag={Link}
              >
                Login
              </Button>
            </Container> 
          </div>
        </div>
        <div
          className="section section-signup"
          id="signup"
          style={{
            backgroundImage: "url(" + require("assets/img/bg11.jpg") + ")",
            backgroundSize: "cover",
            backgroundPosition: "top center",
            minHeight: "700px",
          }}
        >
          <SignUp />
        </div>
        <DarkFooter />
      </div>
    </>
  );
}

export default Index;
