import React from "react";

// reactstrap components
import {
  Container,
  Button,
  Input,
  FormGroup
} from "reactstrap";

import { Link, useHistory } from "react-router-dom";

import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";

import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

import PaginatedTable from "components/Form/PaginatedTable.js";

function ListPage() {
  const history = useHistory();
  const { isSignedIn } = useAuthState();
  const { setMessageOptions, setErrorOptions } = useAlertState();

  const [ rooms, setRooms ] = React.useState([]);
  const [ items, setItems ] = React.useState([]);
  const [ search, setSearch ] = React.useState("");

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

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + "/room/list", {
      method: "GET"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setRooms(json.response);
      }
    });
  }, []);

  React.useEffect(() => {
    let filtered = rooms.filter(r => Object.keys(r).some(k => r[k].includes(search)));
    setItems(filtered);
  }, [rooms, search])

  if(!isSignedIn) {
    history.push("/");
    return;
  }

  const join = (code) => {
    fetch(process.env.REACT_APP_API_URL + "/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setMessageOptions({body: json.response, submit: () => {history.push("/home")}});
      }
      else {
        setErrorOptions({body: json.response});
      }
    });
  };

  const columns = [
    {title: "Title", field: "title"},
    {title: "Author", field: "author", formatter: (item) => (
      <Link to={"/profile/" + item.author}>{item.author}</Link>
    )},
    {title: "Code", field: "code"},
    {title: "Description", field: "desc"},
    {title: "", field: "", formatter: (item) => (
      <Button onClick={() => join(item.code)} color="info" className="btn-sm m-0">Join</Button>
    )}
  ];

  return (
    <>
      <Navbar />
      <div className="wrapper">
        <ProfilePageHeader />
        <div className="section">
          <Container>
            <h3 className="title">Room Listing</h3>
            <FormGroup>
             <label>Search</label>
              <Input
                placeholder="Search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              ></Input>
            </FormGroup>
            <PaginatedTable columns={columns} items={items} />
          </Container>
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default ListPage;
