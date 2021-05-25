/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container, Row, Col } from "reactstrap";

// core components

import { Link } from "react-router-dom";

function DefaultFooter() {
  return (
    <>
      <footer className="footer footer-default">
        <Container>
          <Row>
            <Col>
                <Link to="https://github.com/strellic/Laplace"><i className="fab fa-github text-black"></i></Link>
            </Col>
            <Col className="copyright text-right" id="copyright">
              © {new Date().getFullYear()}, designed by{" "}
              <Link to="https://brycec.me">Bryce</Link>
              {" "}with ❤. 
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
}

export default DefaultFooter;
