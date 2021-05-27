import React from "react";
// reactstrap components
import {
  Row
} from "reactstrap";

import { useLocation, useHistory } from "react-router-dom";

import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";

import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import IDE from "components/IDE/IDE.js";

function IDEPage() {
  const navbarRef = React.createRef();
  const { isSignedIn } = useAuthState();
  const collab = new URLSearchParams(useLocation().search).get("collab");
  const history = useHistory();
  const { setFileListOptions, setErrorOptions, setMessageOptions } = useAlertState();

  const [files, setFiles] = React.useState([]);
  const [base, setBase] = React.useState("");

  React.useEffect(() => {
    if(collab)
      return;

    setFileListOptions({
      title: "Select Folder",
      submitFolder: loadFolder
    });
  }, [collab, setFileListOptions]);

  const loadFolder = (folders, base) => {
    if(base !== "/") {
      for(let i = 0; i < folders.length; i++)
        folders[i].folder = folders[i].folder.slice(base.length) || "/";
    }
    for(let i = 0; i < folders.length; i++) {
      if(!folders[i].folder.endsWith("/"))
        folders[i].folder += "/";
    }

    setFiles(folders);
    setBase(base);
  }

  const saveFiles = (folders) => {
    if(base) {
      for(let i = 0; i < folders.length; i++) {
        folders[i].folder = base + folders[i].folder;
        if(folders[i].folder !== "/" && folders[i].folder.endsWith("/"))
          folders[i].folder = folders[i].folder.slice(0, -1);
      }

      fetch(process.env.REACT_APP_API_URL + "/file/update", {
        method: "POST",
        body: JSON.stringify({ data: folders })
      })
      .then(r => r.json())
      .then(json => {
        if(json.success) {
          setMessageOptions({body: json.response});
        }
        else {
          setErrorOptions({body: json.response});
        }
      })
      .catch(err => {
        setErrorOptions({body: "There was an error saving your files."});
      });
    }
  }

  if(!isSignedIn) {
    history.push("/");
    return <></>;
  }
  
  return (
    <div className="room-wrapper">
      <Navbar transparent={false} fixed={false} className="mb-0" innerRef={navbarRef} />
      <Row className="p-0 m-0 h-100">
        <IDE
          size="full"
          useFileStorage={true}
          navbarRef={navbarRef}
          files={files}
          collabCode={collab}
          base={base}
          onSave={saveFiles}
        />
      </Row>
    </div>
  );
}

export default IDEPage;
