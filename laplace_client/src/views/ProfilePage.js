import React from "react";
import { useParams, useHistory } from "react-router-dom";
import Cookies from 'universal-cookie';

// reactstrap components
import {
  Container,
  Row,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Spinner,
  FormGroup,
  Input,
  Col,
  Button,
  Form
} from "reactstrap";
import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";

import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

function ProfilePage() {
  const { setMessageOptions, setErrorOptions, setFileListOptions } = useAlertState();
  const { isSignedIn, user, email } = useAuthState();
  const cookies = new Cookies();
  const history = useHistory();
  let { target } = useParams();

  if(!target) {
    target = user;
  }

  const [userData, setUserData] = React.useState({});
  const [loaded, setLoaded] = React.useState(false);

  const response = (json) => {
    if(!json.success) {
      return setErrorOptions({body: json.response, submit: () => {
        history.push("/profile");
        history.go(0);
      }});
    }
    setMessageOptions({ body: json.response, submit: () => {
      history.push("/profile");
      history.go(0);
    }});
  };

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + "/user/info?username=" + encodeURIComponent(target), {
      method: "GET"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setUserData(json.response);
        setLoaded(true);
      }
      else {
        setErrorOptions({body: json.response, submit: () => {
          history.push("/home");
        }});
      }
    });
  }, [target, history, setErrorOptions]);

  const [ info, setInfo ] = React.useState({});
  const [ pass, setPass ] = React.useState({});
  const [ bio, setBio ] = React.useState("");

  const updateInfo = (e) => {
    e.preventDefault();

    fetch(process.env.REACT_APP_API_URL + '/user/update_info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: info.username || user,
        email: info.email || email,
        name: info.name || userData.name
      })
    })
    .then(resp => resp.json())
    .then(json => {
      if(!json.success) {
        return setErrorOptions({body: json.response, submit: () => {
          history.push("/profile");
        }});
      }
      setMessageOptions({ body: "Update successful!", submit: () => {
        history.push("/profile");
      }});
      cookies.set("authToken", json.response);
    });
  };

  const changePass = (e) => {
    e.preventDefault();
    fetch(process.env.REACT_APP_API_URL + '/user/update_pass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...pass })
    })
    .then(resp => resp.json())
    .then(response);
  }

  const changeBio = (e) => {
    e.preventDefault();
    fetch(process.env.REACT_APP_API_URL + '/user/update_bio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bio })
    })
    .then(resp => resp.json())
    .then(response);
  }

  const changePic = (file) => {
    fetch(process.env.REACT_APP_API_URL + '/user/update_pic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: file.code })
    })
    .then(resp => resp.json())
    .then(response);
  };

  const deletePic = () => {
    fetch(process.env.REACT_APP_API_URL + '/user/update_pic', {
      method: 'POST'
    })
    .then(resp => resp.json())
    .then(response);
  };

  React.useEffect(() => {
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    return function cleanup() {
      document.body.classList.remove("profile-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  if(!isSignedIn) {
    history.push("/");
    return <></>;
  }

  return (
    <>
      <Navbar />
      <div className="wrapper">
        <ProfilePageHeader />
        <div className="section">
          {loaded ? (
            <Container>
              <Row>
                <Card>
                  <CardBody>
                    <img
                      className="rounded-circle"
                      src={userData.profilepic ?
                        process.env.REACT_APP_API_URL + '/file/' + userData.profilepic
                        : "https://ui-avatars.com/api/?name=" + userData.username
                      }
                      style={{"width": "8rem"}}
                      onError={(e) => {
                        if(target === user) {
                          fetch(process.env.REACT_APP_API_URL + '/user/update_pic', {
                            method: 'POST'
                          });
                        }
                        e.target.src = "https://ui-avatars.com/api/?name=" + userData.username
                      }}
                      alt={userData.username + "'s profile picture"}
                    ></img>
                    <CardTitle tag="h4">{userData.name ? `${userData.name} (${userData.username})` : userData.username}'s Profile</CardTitle>
                    <CardText style={{"whiteSpace": "pre-line"}}>
                      {userData.bio ? userData.bio : "Sadly, we don't have any information about them."}
                    </CardText>
                    <hr />
                    <div>
                      <h5>Room Stats:</h5>
                      <p>Completed: {userData.completed} / {userData.enrolled + userData.created}<br />
                         Created: {userData.created}</p>
                    </div>
                  </CardBody>
                </Card>
              </Row>

              {target === user && (
                <Row>
                <Card>
                  <CardBody>
                    <CardTitle tag="h4">My Account</CardTitle>

                    <Form role="form" onSubmit={updateInfo}>
                      <h6 className="heading-small text-muted mb-4">
                        User information
                      </h6>
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <label>Username</label>
                            <Input
                              placeholder="Username"
                              type="text"
                              defaultValue={userData.username}
                              onChange={(e) => setInfo({...info, username: e.target.value })}
                            ></Input>
                          </FormGroup>
                        </Col>
                        <Col lg="6">
                          <FormGroup>
                            <label>Name</label>
                            <Input
                              placeholder="Name"
                              type="text"
                              defaultValue={userData.name}
                              onChange={(e) => setInfo({...info, name: e.target.value })}
                            ></Input>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <FormGroup>
                            <label>Email</label>
                            <Input
                              placeholder="Email"
                              type="email"
                              defaultValue={email}
                              onChange={(e) => setInfo({...info, email: e.target.value })}
                            ></Input>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Button
                        color="primary"
                        type="button"
                        size="sm"
                        onClick={() => setFileListOptions({title: "Select new profile picture:", submit: changePic})}
                      >
                        Change Profile Picture
                      </Button>
                      <Button
                        color="danger"
                        type="button"
                        size="sm"
                        onClick={deletePic}
                      >
                        Delete Profile Picture
                      </Button>
                      <Button
                        color="info"
                        type="submit"
                        size="sm"
                        className="float-right"
                      >
                       Update Info
                      </Button>
                    </Form>

                    <Form role="form" onSubmit={changePass} className="mt-5">
                      <h6 className="heading-small text-muted mb-4">
                        Change Password
                      </h6>
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <label>Current Password</label>
                            <Input
                              placeholder="Current Password"
                              type="password"
                              onChange={(e) => setPass({...pass, currentPassword: e.target.value })}
                            ></Input>
                          </FormGroup>
                        </Col>
                        <Col lg="6">
                          <FormGroup>
                            <label>New Password</label>
                            <Input
                              placeholder="New Password"
                              type="password"
                              onChange={(e) => setPass({...pass, newPassword: e.target.value })}
                            ></Input>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Button
                        color="info"
                        type="submit"
                        size="sm"
                        className="float-right"
                      >
                       Update Password
                      </Button>
                    </Form>

                    <Form role="form" onSubmit={changeBio} className="mt-5">
                      <h6 className="heading-small text-muted mb-4">
                        ABOUT ME
                      </h6>
                      <Row>
                        <Col>
                          <Input
                            className="form-control-alternative"
                            placeholder=""
                            name="bio"
                            defaultValue={userData.bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows="4"
                            type="textarea"
                          />
                          <Button
                            color="info"
                            type="submit"
                            size="sm"
                            className="float-right"
                          >
                           Update Bio
                          </Button>
                        </Col>
                      </Row>
                    </Form>

                  </CardBody>
                </Card>
              </Row>
              )}
            </Container>
          ) : (
            <Container>
              <Spinner />
            </Container>
          )}
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default ProfilePage;
