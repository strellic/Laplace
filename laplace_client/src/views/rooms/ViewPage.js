import React from "react";
import { useParams, useHistory } from "react-router-dom";
import Confetti from 'react-confetti';
// reactstrap components
import {
  Row,
  Col,
  Spinner,
  Button,
  Form,
  FormGroup,
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
  const history = useHistory();
  const { width, height } = useWindowSize();

  const navbarRef = React.createRef();
  const iframeRef = React.createRef();

  const [loaded, setLoaded] = React.useState(false);
  const [room, setRoom] = React.useState({});
  const [section, setSection] = React.useState({});
  const [num, setNum] = React.useState(0);

  const [answer, setAnswer] = React.useState("");
  const [answers, setAnswers] = React.useState([]);
  const [flag, setFlag] = React.useState("");

  const [confetti, setConfetti] = React.useState(false);
  const [confettiActive, setConfettiActive] = React.useState(true);

  let storageKey = `rooms.${room.code}.num`;

  const checkCompletion = React.useCallback((room, section, force = false) => {
    if(!section.completed || force) {
      if(section.type === "info"
        || (section.type === "website" && force)
        || (section.type === "coding" && section.coding.checks.length === 0)
        || (section.type === "quiz" && force)
        || (section.type === "flag" && flag)) {

        fetch(process.env.REACT_APP_API_URL + "/room/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ room: room.code, section: section.code, answer, answers, flag })
        }).then(resp => resp.json()).then(json => {
          if(json.success) {
            complete(room, section, 
              section.type === "info"
              || (section.type === "coding" && section.coding.checks.length === 0)
              || (section.type === "website" && section.website.autopass));
          }
          else {
            setMessageOptions({title: "Info", body: json.response});
          }
        });
      }
    }
  }, [answer, answers, flag, setMessageOptions]);

  React.useEffect(() => {
    if(loaded) {
      return;
    }

    fetch(process.env.REACT_APP_API_URL + "/room/info", {
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
          setErrorOptions({ body: "This room has no sections.", submit: () => history.push("/home") })
          return;
        }

        let storageKey = `rooms.${room.code}.num`;
        let saved = storage.load(storageKey);
        let nextSection;

        let initial = 0;
        for(; initial < room.sections.length; initial++) {
          if(!room.sections[initial].completed) break;
          if(saved && saved === initial) break;
        }

        setSection(sections[initial]);
        setNum(initial);
        nextSection = room.sections[initial];

        if(nextSection.type === "info") {
          checkCompletion(room, nextSection);
        }

        setLoaded(true);
        if(!nextSection) {
          history.push("/home");
          return <></>;
        }
      }
      else {
        history.push("/home");
      }
    });
  }, [code, loaded, history, checkCompletion, setErrorOptions]);

  React.useEffect(() => {
    if(section.type === "website" && !iframeRef.current.src) {
      iframeRef.current.src = section.website.url;
      if(section.website.autopass) {
        checkCompletion(room, section, true);
      }
    }
    window.onmessage = (e) => {
      if(e.data === "finish") {
        checkCompletion(room, section, true);
      }
    }
  }, [iframeRef, room, section, checkCompletion]);

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
  }, [num, checkCompletion, loaded, room, storageKey]);

  if(!isSignedIn) {
    history.push("/");
    return <></>;
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
        <Button color="success" type="button" onClick={() => setMessageOptions({title: "Congratulations!", body: "You have completed the room!", submit: () => history.push("/home")})}>Finish <i className="fas fa-flag"></i></Button>
      )}
    </div>
  );

  return (
    <div className="room-wrapper">
      <Confetti width={width} height={height} run={confetti} recycle={confettiActive} onConfettiComplete={() => {setConfetti(false); setConfettiActive(true)}} />
      <Navbar transparent={false} fixed={false} className="mb-0" innerRef={navbarRef} />
          <Row className="p-0 h-100 room-content">
            {section.type === "info" && (
              <>
                <div className={"room-col-text " + ["c-half-l", "c-small-l", "c-large-l"][section.layout]}>
                  <div className="mt-3 room-type">{section.type}</div>
                  <h6 className="title room-text">{room.title} ({num+1}/{room.sections.length})</h6>
                  <h5 className="title room-text">{section.title} {section.completed && <i className="fas fa-check text-success"></i>}</h5>
                  <Markdown className="room-text" markdown={section.markdown} />
                  {RoomButtons(num)}
                </div>
                <div className={["c-half-r", "c-large-r", "c-small-r"][section.layout]}>
                  <div className="d-flex below-navbar justify-content-center align-items-center">
                    {section.info?.image ? (
                      <img
                        src={process.env.REACT_APP_API_URL + "/file/" + section.info.image.code}
                        alt="Section"
                        className="c-info-img"
                      ></img>
                    ) : (
                      <img
                        src={require("assets/img/logo.png")}
                        alt="Laplace logo"
                        className="c-info-img"
                      ></img>
                    )}
                  </div>
                </div>
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
                  files={section.coding.files}
                  lang={section.coding.lang}
                  storageKey={`rooms.${room.code}.${section.code}`}
                  checks={section.coding.checks.length > 0}
                  onComplete={() => {complete(room, section)}}
                />
              </>
            )}
            {section.type === "quiz" && (
              <>
                <div className={"room-col-text " + ["c-half-l", "c-small-l", "c-large-l"][section.layout]}>
                  <div className="mt-3 room-type">{section.type}</div>
                  <h6 className="title room-text">{room.title} ({num+1}/{room.sections.length})</h6>
                  <h5 className="title room-text">{section.title} {section.completed && <i className="fas fa-check text-success"></i>}</h5>
                  <Markdown className="room-text" markdown={section.markdown} />
                  {RoomButtons(num)}
                </div>
                <div className={"room-col-text pl-3 " + ["c-half-r", "c-large-r", "c-small-r"][section.layout]}>
                  <h4>{section.quiz.question}</h4>
                  <Form className="ml-4">
                    {section.quiz.answers.map((answer, i) => 
                      <div key={i}>
                        <Input
                          type={section.quiz.all ? "checkbox" : "radio"}
                          onChange={(e) => {
                              e.persist();
                              let checked = e.target.checked;
                              if(section.quiz.all) {
                                setAnswers((prevAns) => console.log(prevAns) || checked ? [...new Set(prevAns.concat(answer.choice))] : answers.filter(a => a !== answer.choice))
                              }
                              else {
                                setAnswer(checked ? answer.choice : "");
                              }
                            }
                          }
                          name="answer"
                          id={`answer_${i}`}
                        />
                        <h5 className="ml-6"><label htmlFor={`answer_${i}`}>{answer.choice}</label></h5>
                      </div>
                    )}
                  </Form>
                  <Button color="info" type="button" onClick={() => checkCompletion(room, section, true)}><i className="fas fa-check"></i> Submit</Button>
                </div>
              </>
            )}
            {section.type === "flag" && (
              <>
                <div className={"room-col-text " + ["c-half-l", "c-small-l", "c-large-l"][section.layout]}>
                  <div className="mt-3 room-type">{section.type}</div>
                  <h6 className="title room-text">{room.title} ({num+1}/{room.sections.length})</h6>
                  <h5 className="title room-text">{section.title} {section.completed && <i className="fas fa-check text-success"></i>}</h5>
                  <Markdown className="room-text" markdown={section.markdown} />
                  {RoomButtons(num)}
                </div>
                <div className={"room-col-text pl-3 pr-3 " + ["c-half-r", "c-large-r", "c-small-r"][section.layout]}>
                  <h4>Answer:</h4>
                  <FormGroup>
                    <Input
                      type="text"
                      value={flag}
                      onChange={e => setFlag(e.target.value)}
                    />
                  </FormGroup>
                  <Button color="info" type="button" onClick={() => checkCompletion(room, section, true)}><i className="fas fa-check"></i> Submit</Button>
                </div>
              </>
            )}
            {section.type === "website" && (
              <>
                <div className={"room-col-text " + ["c-half-l", "c-small-l", "c-large-l"][section.layout]}>
                  <div className="mt-3 room-type">{section.type}</div>
                  <h6 className="title room-text">{room.title} ({num+1}/{room.sections.length})</h6>
                  <h5 className="title room-text">{section.title} {section.completed && <i className="fas fa-check text-success"></i>}</h5>
                  <Markdown className="room-text" markdown={section.markdown} />
                  {RoomButtons(num)}
                </div>
                <div className={"bg-white p-0 " + ["c-half-r", "c-large-r", "c-small-r"][section.layout]}>
                  <iframe className="w-100 h-100 border-0" ref={iframeRef} title="Interactive application"></iframe>
                </div>
              </>
            )}
          </Row>
    </div>
  );
}

export default ViewPage;
