import React from "react";
// reactstrap components
import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
} from "reactstrap";

import { NavLink as RRNavLink } from 'react-router-dom';

function IndexNavbar({ transparent = true, fixed = true, innerRef, className }) {
  const [navbarColor, setNavbarColor] = React.useState(transparent ? "navbar-transparent": "");
  const [collapseOpen, setCollapseOpen] = React.useState(false);
  React.useEffect(() => {
    const updateNavbarColor = () => {
      if(!transparent) {
        setNavbarColor("");
      }
      else {
        if ((document.documentElement.scrollTop > 399 || document.body.scrollTop > 399)) {
          setNavbarColor("");
        } else if (
          document.documentElement.scrollTop < 400 ||
          document.body.scrollTop < 400
        ) {
          setNavbarColor("navbar-transparent");
        }
      }
    };
    window.addEventListener("scroll", updateNavbarColor);
    return function cleanup() {
      window.removeEventListener("scroll", updateNavbarColor);
    };
  });
  return (
    <>
      {collapseOpen ? (
        <div
          id="bodyClick"
          onClick={() => {
            document.documentElement.classList.toggle("nav-open");
            setCollapseOpen(false);
          }}
        />
      ) : null}
      <Navbar className={(fixed ? "fixed-top " : "") + navbarColor + " " + className} expand="lg" color="info">
        <Container>
          <div ref={innerRef} className="navbar-translate">
            <NavbarBrand tag={RRNavLink} to="/" id="navbar-brand">
              Laplace
            </NavbarBrand>
            <button
              className="navbar-toggler navbar-toggler"
              onClick={() => {
                document.documentElement.classList.toggle("nav-open");
                setCollapseOpen(!collapseOpen);
              }}
              aria-expanded={collapseOpen}
              type="button"
            >
              <span className="navbar-toggler-bar top-bar"></span>
              <span className="navbar-toggler-bar middle-bar"></span>
              <span className="navbar-toggler-bar bottom-bar"></span>
            </button>
          </div>
          <Collapse
            className="justify-content-end"
            isOpen={collapseOpen}
            navbar
          >
            <Nav navbar>
              <NavItem>
                <NavLink tag={RRNavLink} exact activeClassName="active" to="/register">
                  <i className="fas fa-user mr-1"></i>
                  <span>Register</span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} exact activeClassName="active" to="/login">
                  <i className="fas fa-sign-in-alt  mr-1"></i>
                  <span>Login</span>
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default IndexNavbar;
