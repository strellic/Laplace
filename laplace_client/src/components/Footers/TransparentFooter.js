/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container, Row, Col } from "reactstrap";

import { Link } from "react-router-dom";

function TransparentFooter() {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col className="text-left">
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/strellic/Laplace"><i className="fab fa-github text-white"></i></a>
          </Col>
          <Col className="copyright text-right" id="copyright">
            © {new Date().getFullYear()}, designed by{" "}
            <a target="_blank" rel="noopener noreferrer" href="https://brycec.me">Bryce</a>
            {" "}with ❤️. 
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default TransparentFooter;
