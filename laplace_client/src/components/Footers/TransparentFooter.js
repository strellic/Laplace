/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container, Row, Col } from "reactstrap";

function TransparentFooter() {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col className="text-left">
              <a href="https://github.com/strellic/Laplace" target="_blank"><i className="fab fa-github text-white"></i></a>
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
  );
}

export default TransparentFooter;
