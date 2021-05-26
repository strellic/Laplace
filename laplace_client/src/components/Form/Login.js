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

  const [error, setError] = React.useState("");
  const [disabled, setDisabled] = React.useState(false);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const submitForm = (e) => {
    e.preventDefault();

    setDisabled(true);

    fetch(process.env.REACT_APP_API_URL + '/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password})
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

  return (
    <>
        <Container>
          <Row>
            <Card className="card-signup" data-background-color="blue">
              <Form className="form" onSubmit={submitForm}>
                <CardHeader className="text-center">
                  <CardTitle className="title-up" tag="h3">
                    Log In
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
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setPassFocus(true)}
                      onBlur={() => setPassFocus(false)}
                      required
                      minLength={8}
                    ></Input>
                  </InputGroup>
                </CardBody>
                <CardFooter className="text-center pt-0">
                  <Button
                    className="btn-neutral btn-round"
                    color="info"
                    type="submit"
                    size="lg"
                    disabled={disabled}
                  >
                    Log In
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
