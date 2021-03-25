/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container } from "reactstrap";

function TransparentFooter() {
  return (
    <footer className="footer">
      <Container>
        <div className="copyright" id="copyright">
          © {new Date().getFullYear()}, designed by{" "}
          <a
            href="https://brycec.me"
            target="_blank"
          >
            Bryce
          </a>
          {" "}with ❤️. 
        </div>
      </Container>
    </footer>
  );
}

export default TransparentFooter;
