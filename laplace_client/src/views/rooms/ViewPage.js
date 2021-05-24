import React from "react";
import { useParams } from "react-router-dom";
import Confetti from 'react-confetti';
// reactstrap components
import {
  Row,
  Col,
  Spinner,
  Container,
  Button,
  Form,
  FormGroup,
  Label,
  Input
} from "reactstrap";

import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";
import useWindowSize from "context/windowsize.js";

import fetch from "utils/fetch.js";
import storage from "utils/storage.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import Markdown from "components/Markdown.js";
import IDE from "components/IDE/IDE.js";

function ViewPage() {
  const { isSignedIn } = useAuthState();
  const { setMessageOptions, setErrorOptions } = useAlertState();
  const { code } = useParams();
  const { width, height } = useWindowSize();

  const navbarRef = React.createRef();
  const iframeRef = React.createRef();

  const [loaded, setLoaded] = React.useState(false);
  const [room, setRoom] = React.useState({});
  const [section, setSection] = React.useState({});
  const [num, setNum] = React.useState(0);

  const [answer, setAnswer] = React.useState("");
  const [flag, setFlag] = React.useState("");

  const [confetti, setConfetti] = React.useState(false);
  const [confettiActive, setConfettiActive] = React.useState(true);

  let storageKey = `rooms.${room.code}.num`;

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + "/api/room/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        let room = json.response;
        let sections = room.sections;

        setRoom(room);

        if(!sections || sections.length === 0) {
          setErrorOptions({ body: "This room has no sections.", submit: () => window.location = "/home" })
          return;
        }

        let storageKey = `rooms.${room.code}.num`;
        let saved = storage.load(storageKey);
        let nextSection;

        if(saved && typeof saved === "number" && saved >= 0 && saved < room.sections.length && room.sections[Math.max(saved-1, 0)].completed) {
          setNum(storage.load(storageKey));
          setSection(room.sections[storage.load(storageKey)]);
          nextSection = room.sections[storage.load(storageKey)];
        }
        else {
          setSection(sections[0]);
          nextSection = sections[0];
        }

        if(nextSection.type === "info") {
          checkCompletion(room, nextSection);
        }

        setLoaded(true);
        if(!nextSection) {
          window.location = "/home";
          return;
        }
      }
      else {
        window.location = "/home";
      }
    });
  }, []);

  React.useEffect(() => {
    if(section.type === "jsapp" && !iframeRef.current.src) {
      if(section.files.length > 0) {
        let file;
        if(section.files.find(f => f.folder === "/") && section.files.find(f => f.folder === "/").files.find(f => f.filename === "index.html")) 
          file = section.files.find(f => f.folder === "/").files.find(f => f.filename === "index.html");
        else
          file = section.files[0].files[0];
        iframeRef.current.src = process.env.REACT_APP_API_URL + "/api/file/" + file.code;
      }
      window.onmessage = (e) => {
        if(e.origin === process.env.REACT_APP_API_URL) {
          if(e.data === "finish") {
            checkCompletion(room, section, true);
          }
        }
      }
    }
  }, [iframeRef]);

  const checkCompletion = (room, section, force = false) => {
    // if author viewing, checks will be the array of test cases
    // if student viewing, checks will be a boolean
    let hasChecks = (Array.isArray(section.checks) && section.checks.length > 0)
                    || (!Array.isArray(section.checks) && section.checks);  

    if(!section.completed || force) {
      if(section.type === "info" || (section.type === "jsapp" && force) || (section.type === "coding" && !hasChecks) || (section.type === "quiz" && answer) || (section.type === "flag" && flag)) {
        fetch(process.env.REACT_APP_API_URL + "/api/room/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ room: room.code, section: section.code, answer, flag })
        }).then(resp => resp.json()).then(json => {
          if(json.success) {
            complete(room, section, section.type === "info" || (section.type === "coding" && !hasChecks));
          }
          else {
            setMessageOptions({title: "Info", body: json.response});
          }
        });
      }
    }
  }

  const complete = (room, section, noConfetti = false) => {
    if(!noConfetti) {
      setConfetti(true);
      setTimeout(() => setConfettiActive(false), 3000);
    }
    
    let sections = room.sections;
    sections.find(find => find.code === section.code).completed = true;
    setRoom({...room, sections});
    setSection({...section, completed: true});
  }

  React.useEffect(() => {
    if(loaded) {
      storage.save(storageKey, num);
      setSection(room.sections[num]);
      checkCompletion(room, room.sections[num]);
    }
  }, [num]);

  if(!isSignedIn) {
    window.location = "/";
    return;
  }

  if(!section) {
    return (
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <Spinner color="info" style={{ width: '8rem', height: '8rem' }} />
      </div>
    );
  }

  const RoomButtons = (num) => (
    <div className="room-buttons">
      {loaded && num > 0 && (
        <Button color="danger" type="button" onClick={() => setNum(num-1)}><i className="fas fa-arrow-left"></i> Prev</Button>
      )}
      {(loaded && num <= room.sections.length - 2 && section.completed) && (
        <Button color="info" type="button" onClick={() => setNum(num+1)}>Next <i className="fas fa-arrow-right"></i></Button>
      )}
      {(loaded && section.completed && num === room.sections.length - 1) && (
        <Button color="success" type="button" onClick={() => setMessageOptions({title: "Congratulations!", body: "You have completed the room!", submit: () => window.location = "/home"})}>Finish <i className="fas fa-flag"></i></Button>
      )}
    </div>
  );

  return (
    <div className="room-wrapper">
      <Confetti width={width} height={height} run={confetti} recycle={confettiActive} onConfettiComplete={() => {setConfetti(false); setConfettiActive(true)}} />
      <Navbar transparent={false} fixed={false} className="mb-0" innerRef={navbarRef} />
          <Row className="p-0 h-100">
            {section.type === "info" && (
              <>
                <Col className="room-col-text col-9">
                  <div className="mt-3 room-type">{section.type}</div>
                  <h6 className="title room-text">{room.title} ({num+1}/{room.sections.length})</h6>
                  <h5 className="title room-text">{section.title} {section.completed && <i className="fas fa-check text-success"></i>}</h5>
                  <Markdown className="room-text" markdown={section.markdown} />
                  {RoomButtons(num)}
                </Col>
                <Col className="col-3 room-laplace-col">
                  <img
                    className="room-laplace"
                    src={require("assets/img/logo.png")}
                  ></img>
                </Col>
              </>
            )}
            {section.type === "coding" && (
              <>
                <Col className="room-col-text col-4">
                  <div className="mt-3 room-type">{section.type}</div>
                  <h6 className="title room-text">{room.title} ({num+1}/{room.sections.length})</h6>
                  <h5 className="title room-text">{section.title} {section.completed && <i className="fas fa-check text-success"></i>}</h5>
                  <Markdown className="room-text" markdown={section.markdown} />
                  {RoomButtons(num)}
                </Col>
                <IDE 
                  navbarRef={navbarRef}
                  key={section.code}
                  room={room.code}
                  section={section.code}
                  files={section.files}
                  lang={section.lang}
                  storageKey={`rooms.${room.code}.${section.code}`}
                  checks={(Array.isArray(section.checks) && section.checks.length > 0) || (!Array.isArray(section.checks) && section.checks)}
                  onComplete={() => {complete(room, section)}}
                />
              </>
            )}
            {section.type === "quiz" && (
              <>
                <Col className="room-col-text col-6">
                  <div className="mt-3 room-type">{section.type}</div>
                  <h6 className="title room-text">{room.title} ({num+1}/{room.sections.length})</h6>
                  <h5 className="title room-text">{section.title} {section.completed && <i className="fas fa-check text-success"></i>}</h5>
                  <Markdown className="room-text" markdown={section.markdown} />
                  {RoomButtons(num)}
                </Col>
                <Col className="room-col-text col-6 pl-3">
                  <h4>{section.question}</h4>
                  <Form className="ml-4">
                    {section.answers.map((answer, i) => 
                      <div key={`answer_${i}`}>
                        <Input
                          type="radio"
                          onChange={e => setAnswer(e.target.checked ? answer.choice : "")}
                          name="answer"
                        />
                        <h5 className="ml-6">{answer.choice}</h5>
                      </div>
                    )}
                  </Form>
                  <Button color="info" type="button" onClick={() => checkCompletion(room, section, true)}><i className="fas fa-check"></i> Submit</Button>
                </Col>
              </>
            )}
            {section.type === "flag" && (
              <>
                <Col className="room-col-text col-6">
                  <div className="mt-3 room-type">{section.type}</div>
                  <h6 className="title room-text">{room.title} ({num+1}/{room.sections.length})</h6>
                  <h5 className="title room-text">{section.title} {section.completed && <i className="fas fa-check text-success"></i>}</h5>
                  <Markdown className="room-text" markdown={section.markdown} />
                  {RoomButtons(num)}
                </Col>
                <Col className="room-col-text col-6 pl-3 pr-3">
                  <h4>Answer:</h4>
                  <FormGroup>
                    <Input
                      type="text"
                      value={flag}
                      onChange={e => setFlag(e.target.value)}
                    />
                  </FormGroup>
                  <Button color="info" type="button" onClick={() => checkCompletion(room, section, true)}><i className="fas fa-check"></i> Submit</Button>
                </Col>
              </>
            )}
            {section.type === "jsapp" && (
              <>
                <Col className="room-col-text col-6">
                  <div className="mt-3 room-type">{section.type}</div>
                  <h6 className="title room-text">{room.title} ({num+1}/{room.sections.length})</h6>
                  <h5 className="title room-text">{section.title} {section.completed && <i className="fas fa-check text-success"></i>}</h5>
                  <Markdown className="room-text" markdown={section.markdown} />
                  {RoomButtons(num)}
                </Col>
                <Col className="bg-white col-6 p-0">
                  <iframe className="jsapp-iframe w-100 h-100 border-0" ref={iframeRef}></iframe>
                </Col>
              </>
            )}
          </Row>
    </div>
  );
}

export default ViewPage;
