import React from "react";

// reactstrap components
import { Container } from "reactstrap";
import { useAuthState } from "context/auth.js";

import fetch from "utils/fetch.js";

// core components

function ProfilePageHeader() {
  let pageHeader = React.createRef();
  const { user } = useAuthState();

  const [done, setDone] = React.useState(0);
  const [joined, setJoined] = React.useState(0);

  React.useEffect(() => {
    if(sessionStorage.rooms) {
      try {
        let data = JSON.parse(sessionStorage.rooms);
        if(data.time && data.time + 1000*60*3 > +new Date()) {
          setJoined(data.joined);
          setDone(data.done);
          return;
        }
        else {
          sessionStorage.removeItem("rooms");
        }
      }
      catch(err) {}
    }

    fetch(process.env.REACT_APP_API_URL + "/user/rooms", {
      method: "POST"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        let data = {
          joined: json.response.enrolled.length,
          done: json.response.completed.map(t => t.sections.length === t.room.sections.length).filter(Boolean).length,
          time: +new Date()
        };
        sessionStorage.rooms = JSON.stringify(data);
        setJoined(data.joined);
        setDone(data.done);
      }
    });
  }, []);

  React.useEffect(() => {
    if (window.innerWidth > 991) {
      const updateScroll = () => {
        let windowScrollTop = window.pageYOffset / 3;
        if(pageHeader && pageHeader.current)
          pageHeader.current.style.transform = "translate3d(0," + windowScrollTop + "px,0)";
      };
      window.addEventListener("scroll", updateScroll);
      return function cleanup() {
        window.removeEventListener("scroll", updateScroll);
      };
    }
  });

  return (
    <>
      <div
        className="page-header clear-filter page-header-small"
        filter-color="blue"
      >
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/bg5.jpg") + ")",
          }}
          ref={pageHeader}
        ></div>
        <Container>
          <h3 className="title">Welcome, {user}!</h3>
          <div className="content">
            <div className="d-inline-block mr-2">
              <h2>{done}</h2>
              <p>Rooms Done</p>
            </div>
            <div className="d-inline-block ml-2">
              <h2>{joined}</h2>
              <p>Rooms Joined</p>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default ProfilePageHeader;
