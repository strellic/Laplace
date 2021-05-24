/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container, Row, Col } from "reactstrap";

// core components

function DefaultFooter() {
  return (
    <>
      <footer className="footer footer-default">
        <Container>
          <Row>
            <Col>
                <a href="https://github.com/strellic/Laplace" target="_blank"><i className="fab fa-github text-black"></i></a>
            </Col>
            <Col className="copyright text-right" id="copyright">
              © {new Date().getFullYear()}, designed by{" "}
              <a
                href="https://brycec.me"
                target="_blank"
              >
                Bryce
              </a>
              {" "}with ❤️. 
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
}

export default DefaultFooter;
