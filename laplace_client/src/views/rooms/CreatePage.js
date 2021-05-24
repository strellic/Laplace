import React from "react";
import { useParams, useLocation } from "react-router-dom";
// reactstrap components
import {
  Button,
  Container,
  Row,
  Col,
  Input,
  Form,
  FormGroup,
  Label
} from "reactstrap";
import { sortableContainer, sortableElement } from 'react-sortable-hoc';

import fetch from "utils/fetch.js";

import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";

// core components
import AuthNavbar from "components/Navbars/AuthNavbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

import SectionCard from "components/Cards/SectionCard.js";

import PaginatedTable from "components/Form/PaginatedTable.js";

import CreateSection from "components/Modals/CreateSection.js";
import EditSection from "components/Modals/EditSection.js";
import ExportModal from "components/Modals/ExportModal.js";
import ImportModal from "components/Modals/ImportModal.js";

function CreatePage() {
  const { user, isSignedIn } = useAuthState();
  const { setErrorOptions, setMessageOptions } = useAlertState();

  const isEditing = useLocation().pathname.startsWith("/rooms/edit/");
  const { code } = useParams();

  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");

  const [members, setMembers] = React.useState([]);

  const [isPublic, setPublic] = React.useState(false);

  const [createModal, setCreateModal] = React.useState(false);
  const [editModal, setEditModal] = React.useState(false);
  const [exportModal, setExportModal] = React.useState(false);
  const [importModal, setImportModal] = React.useState(false);

  const [sections, setSections] = React.useState([]);

  const sectionsRef = React.useRef(sections);
  const sectionRef = React.useRef({});

  const editSection = (title) => {
    let section = sectionsRef.current.find(section => section.title === title);
    if(!section) {
      setErrorOptions({body: "No section found with that title."});
    }

    sectionRef.current = section;
    setEditModal(true);
  }

  const deleteSection = (title) => {
    setSections([...sectionsRef.current].filter(check => check.title !== title));
  }

  const fixupSection = (section) => {
    return {...section, onClick: editSection, onDelete: deleteSection}
  }

  const createSection = ({ title }) => {
    if(sectionsRef.current.find(section => section.title === title)) {
      return setErrorOptions({body: "A section already exists with that title."});
    }
    if(!title) {
      return setErrorOptions({body: "You must provide a title."});
    }

    setSections([...sectionsRef.current, {
      title,
      type: "info"
    }]);
  }

  const finishSection = (modified) => {
    let index = sectionsRef.current.findIndex(section => section.title === sectionRef.current.title);
    let newSections = [...sectionsRef.current];
    newSections[index] = modified;
    setSections(newSections);
  }

  const finishImport = (json) => {
    let data = JSON.parse(json);
    setTitle(data.title);
    setDesc(data.desc);
    setSections(data.sections);
    setPublic(data.public);

    if(data.members)
      setMembers(data.members);
  }

  const saveRoom = () => {
    let roomData = { title, desc, sections: sectionsRef.current, "public": isPublic };
    fetch(process.env.REACT_APP_API_URL + (isEditing ? "/room/edit" : "/room/create"), {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ roomData, code })
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setMessageOptions({body: json.response, submit: () => {window.location = "/home";}});
      }
      else {
        setErrorOptions({body: json.response});
      }
    });
  }

  const deleteRoom = () => {
    fetch(process.env.REACT_APP_API_URL + "/room/delete", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
         setMessageOptions({body: json.response, submit: () => {window.location = "/home";}});
      }
      else {
        setErrorOptions({body: json.response, submit: () => {window.location = "/home";}});
      }
    });
  }

  const SortableItem = sortableElement(({value}) => <SectionCard {...value} />);

  const SortableContainer = sortableContainer(({children}) => {
    return <div>{children}</div>;
  });

  const onSortEnd = ({ oldIndex, newIndex }) => {
    let modified = [...sectionsRef.current];
    modified.splice(newIndex, 0, modified.splice(oldIndex, 1)[0]);
    setSections(modified);
  };

  React.useEffect(() => {
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    if(isEditing) {
      fetch(process.env.REACT_APP_API_URL + `/room/info`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      }).then(resp => resp.json()).then(json => {
        if(json.success) {
          if(json.response.author !== user) {
            return setErrorOptions({body: "You are not this room's creator!", submit: () => {window.location = "/home";}});
          }

          for(let i = 0; i < json.response.sections.length; i++) {
            delete json.response.sections[i].completed;
            if(json.response.sections[i].checks && json.response.sections[i].checks.length === 0)
              delete json.response.sections[i].checks;
            if(json.response.sections[i].answers && json.response.sections[i].answers.length === 0)
              delete json.response.sections[i].answers;
          }

          finishImport(JSON.stringify(json.response));
        }
        else {
          setErrorOptions({body: "No room was found with that code.", submit: () => {window.location = "/home";}});
        }
      });
    }

    return function cleanup() {
      document.body.classList.remove("profile-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, [code, isEditing, user, setErrorOptions]);

  React.useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  if(!isSignedIn) {
    window.location = "/";
    return;
  }

  return (
    <>
      <AuthNavbar />
      <div className="wrapper">
        <CreateSection open={setCreateModal} isOpen={createModal} submit={createSection} />
        <EditSection open={setEditModal} isOpen={editModal} section={sectionRef.current} submit={finishSection} key={sectionRef.current.title} />
        <ExportModal open={setExportModal} isOpen={exportModal} data={JSON.stringify({title, desc, sections: sectionsRef.current, "public": isPublic}, null, " ".repeat(4))} />
        <ImportModal open={setImportModal} isOpen={importModal} submit={finishImport} />

        <ProfilePageHeader />
        <div className="section">
          <Container>
            <h3 className="title">Room {isEditing ? "Editor": "Creator"}</h3>
            <h4 className="title">Room Details</h4>
            {isEditing && <h5>Room Code: {code}</h5>}
            <Row>
              <Col>
               <Form>
                <FormGroup>
                  <label htmlFor="title-input">Room Title</label>
                  <Input
                    placeholder="Enter title"
                    type="text"
                    id="title-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  ></Input>
                </FormGroup>
                <FormGroup>
                  <label htmlFor="desc-input">Description</label>
                  <Input
                    placeholder="Enter description"
                    type="text"
                    id="desc-input"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                  ></Input>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={isPublic}
                      onChange={e => setPublic(e.target.checked)}
                    >
                    </Input>
                    <span className="form-check-sign"></span>
                    Public Room
                  </Label>
                </FormGroup>
              </Form>
              </Col>
            </Row>
            <h4 className="title">Sections</h4>
            <br />
            <Row>
              <SortableContainer onSortEnd={onSortEnd} axis="x">
                {sections.map((value, index) => (
                  <SortableItem key={index} index={index} value={fixupSection(value)} />
                ))}
              </SortableContainer>
              <SectionCard title="Create Section" desc="Create a new section here." button="Create +" onClick={() => setCreateModal(true)}/>
            </Row>

            {(isEditing && members && members.length > 0) && (
              <>
                <h4 className="title">Members</h4>
                <h5>Total enrolled: {members.length} </h5>

                <PaginatedTable
                  columns={[
                    {title: "Username", field: "username", formatter: (item) => (
                      <a href={"/profile/" + item.username} target="_blank" rel="noopener noreferrer">{item.username}</a>
                    )},
                    {title: "Completion", field: "completed", formatter: (item) => (
                      <>{item.completed ? item.completed.length : 0} / {sections.length} sections</>
                    )}
                  ]}
                  items={members}
                />

                <br />
              </>
            )}

            <Row className="pull-right">
              <Button color="success" type="button" size="sm" onClick={() => setExportModal(true)}>Export</Button>
              <Button color="primary" type="button" size="sm" onClick={() => setImportModal(true)}>Import</Button>
              {isEditing && (<Button color="danger" type="button" size="sm" onClick={deleteRoom}>Delete</Button>)}
              <Button color="info" type="button" size="sm" onClick={saveRoom}>Save</Button>
            </Row>
          </Container>
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default CreatePage;
