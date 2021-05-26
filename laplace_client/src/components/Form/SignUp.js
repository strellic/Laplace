import React from "react";
import Cookies from 'universal-cookie';

//import { useHistory } from "react-router-dom";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Alert
} from "reactstrap";

// core components

import fetch from "utils/fetch.js";

function SignUp() {
  const cookies = new Cookies();
  //const history = useHistory();

  const [userFocus, setUserFocus] = React.useState(false);
  const [passFocus, setPassFocus] = React.useState(false);
  const [verifyPassFocus, setVerifyPassFocus] = React.useState(false);
  const [emailFocus, setEmailFocus] = React.useState(false);

  const [error, setError] = React.useState("");
  const [disabled, setDisabled] = React.useState(false);

  const [passStrength, setPassStrength] = React.useState(["text-danger font-weight-700", "weak"]);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifyPassword, setVerifyPassword] = React.useState("");
  const [email, setEmail] = React.useState("");

  const submitForm = (e) => {
    e.preventDefault();

    setDisabled(true);

    if(verifyPassword !== password) {
      setDisabled(false);
      return setError("The passwords are not the same!");
    }

    fetch(process.env.REACT_APP_API_URL + '/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, email, password})
    })
    .then(resp => resp.json())
    .then(json => {
      setDisabled(false);

      if(json.success) {
        cookies.set("authToken", json.response);
        //history.push("/home");
        window.location = "/home";
      }
      else {
        setError(json.response);
      }
    });
  }

  const scorePassword = (pass) => {
    let score = 0;

    if (!pass)
        return setPassStrength(["text-danger font-weight-700", "weak"]);

    let letters = {};
    for (let i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    let variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    }

    let variationCount = 0;
    for (let check in variations) {
        variationCount += (variations[check]) ? 1 : 0;
    }
    score += parseInt((variationCount - 1) * 10);

    if (score >= 80)
      return setPassStrength(["text-success font-weight-700", "strong"]);
    if (score >= 50)
      return setPassStrength(["text-warning font-weight-700", "okay"]);
    return setPassStrength(["text-danger font-weight-700", "weak"]);
  }

  return (
    <>
        <Container>
          <Row>
            <Card className="card-signup" data-background-color="blue">
              <Form className="form" onSubmit={ (e) => submitForm(e) }>
                <CardHeader className="text-center">
                  <CardTitle className="title-up" tag="h3">
                    Sign Up
                  </CardTitle>
                  {error &&
                    (<Alert color="danger">
                      {error}
                    </Alert>)
                  }
                </CardHeader>
                <CardBody>
                  <InputGroup
                    className={
                      "no-border" + (userFocus ? " input-group-focus" : "")
                    }
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="fas fa-user"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Username"
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      onFocus={() => setUserFocus(true)}
                      onBlur={() => setUserFocus(false)}
                      required
                      minLength={6}
                    ></Input>
                  </InputGroup>
                  <InputGroup
                    className={
                      "no-border" + (emailFocus ? " input-group-focus" : "")
                    }
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="fas fa-envelope"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setEmailFocus(true)}
                      onBlur={() => setEmailFocus(false)}
                    ></Input>
                  </InputGroup>
                  <InputGroup
                    className={
                      "no-border" + (passFocus ? " input-group-focus" : "")
                    }
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="fas fa-key"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); scorePassword(e.target.value) } }
                      onFocus={() => setPassFocus(true)}
                      onBlur={() => setPassFocus(false)}
                      required
                      minLength={8}
                    ></Input>
                  </InputGroup>
                  <InputGroup
                    className={
                      "no-border" + (verifyPassFocus ? " input-group-focus" : "")
                    }
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="fas fa-key"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Verify Password"
                      type="password"
                      value={verifyPassword}
                      onChange={e => setVerifyPassword(e.target.value)}
                      onFocus={() => setVerifyPassFocus(true)}
                      onBlur={() => setVerifyPassFocus(false)}
                      required
                      minLength={8}
                    ></Input>
                  </InputGroup>
                </CardBody>
                <div className="text-center">
                  <span>
                    password strength:{" "}
                    <strong className={passStrength[0]}>{passStrength[1]}</strong>
                  </span>
                </div>
                <CardFooter className="text-center pt-0">
                  <Button
                    className="btn-neutral btn-round"
                    color="info"
                    type="submit"
                    size="lg"
                    disabled={disabled}
                  >
                    Register
                  </Button>
                </CardFooter>
              </Form>
            </Card>
          </Row>
        </Container>
    </>
  );
}

export default SignUp;
