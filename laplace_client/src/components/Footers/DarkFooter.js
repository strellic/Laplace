/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

function DarkFooter() {
  return (
    <footer className="footer" style={{"backgroundColor": "#2c2c2c"}}>
      <Container className="text-white">
        <Row>
          <Col>
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

export default DarkFooter;
