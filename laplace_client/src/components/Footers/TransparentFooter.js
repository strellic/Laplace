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
              <Link to="https://github.com/strellic/Laplace"><i className="fab fa-github text-white"></i></Link>
          </Col>
          <Col className="copyright text-right" id="copyright">
            © {new Date().getFullYear()}, designed by{" "}
            <Link to="https://brycec.me">Bryce</Link>
            {" "}with ❤️. 
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default TransparentFooter;
