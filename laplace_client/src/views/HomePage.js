import React from "react";

// reactstrap components
import {
  Container,
  Row
} from "reactstrap";
import { useHistory } from "react-router-dom";
import { useAuthState } from "context/auth.js";

import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

import RoomCard from "components/Cards/RoomCard.js";
import InputModal from "components/Modals/InputModal.js";
import MessageModal from "components/Modals/MessageModal.js";

function HomePage() {
  const { isSignedIn } = useAuthState(true);
  const history = useHistory();

  const [joinModal, setJoinModal] = React.useState(false);
  const [messageModal, setMessageModal] = React.useState(false);

  const [message, setMessage] = React.useState("");

  const [enrolled, setEnrolled] = React.useState([]);
  const [created, setCreated] = React.useState([]);
  const [completed, setCompleted] = React.useState([]);

  const join = (code) => {
    fetch(process.env.REACT_APP_API_URL + "/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    }).then(resp => resp.json()).then(json => {
      setMessage(json.response);
      setMessageModal(true);
      if(json.success) {
        load();
      }
    });
  }

  const getCompleted = (room) => {
    if(completed.length > 0) {
      return completed.find(c => c.room.code === room.code);
    }
    return null;
  }

  const load = () => {
    fetch(process.env.REACT_APP_API_URL + "/user/rooms", {
      method: "POST"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setEnrolled(json.response.enrolled);
        setCreated(json.response.created);
        setCompleted(json.response.completed);
      }
    });
  }

  React.useEffect(() => {
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    load();

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
        <InputModal open={setJoinModal} isOpen={joinModal} submit={join} title="Join Room" body="Enter room code below:" button="Join" />
        <MessageModal open={setMessageModal} isOpen={messageModal} title="Join Room" body={message} />
        <ProfilePageHeader />
        <div className="section">
          <Container>
            <h3 className="title">Enrolled Rooms</h3>
            <Row>
              {enrolled && enrolled.map((room, i) => <RoomCard key={i} completed={getCompleted(room)} {...room} buttons={[{to: "/rooms/view/" + room.code, text: "Open"}]} />)}
              <RoomCard title="Join Room" desc="Join a new room here by entering its room code." buttons={[{onClick: () => {setJoinModal(true)}, text: "Join +"}]} />
            </Row>
          </Container>
          <Container>
            <h3 className="title">Created Rooms</h3>
            <Row>
              {created && created.map((room, i) => <RoomCard key={i} completed={getCompleted(room)} {...room} buttons={[
                {to: "/rooms/view/" + room.code, text: "Open"},
                {to: "/rooms/edit/" + room.code, text: "Manage", color: "danger"}
              ]} />)}
              <RoomCard title="Create Room" desc="Create your own room with custom challenges and content here!" buttons={[{to: "/rooms/create", text: "Create +"}]} />
            </Row>
          </Container>
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default HomePage;
