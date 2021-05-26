import React from "react";
import { FileIcon } from 'react-file-icon';

// reactstrap components
import { 
  Button,
  Modal,
  Row,
  Col,
  Container,
  Progress
} from "reactstrap";
// core components

import fetch from "utils/fetch.js";
import { useAlertState } from "context/alert.js";

function FileListModal({open, isOpen, submit, submitFolder, title = "Files"}){
  const [response, setResponse] = React.useState({});
  const [files, setFiles] = React.useState([]);
  const [folders, setFolders] = React.useState([]);

  const [space, setSpace] = React.useState(0);
  const [cwd, setCwd] = React.useState("/");

  const { setPleaseWaitOptions, setConfirmOptions, setErrorOptions, setMessageOptions, setDragDropOptions, setInputOptions } = useAlertState();

  const refresh = React.useCallback(() => {
    fetch(process.env.REACT_APP_API_URL + "/file/list", {
      method: "POST",
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setResponse(json.response);
      }
      else {
        open(false);
      }
    });
  }, [open]);

  React.useEffect(() => {
    if(isOpen)
      refresh();
  }, [isOpen, refresh]);

  const update = React.useCallback(() => {
    if(Object.keys(response).length === 0)
      return;

    let max = 128*1024*1024;
    let total = 0;
    for(let i = 0; i < response.length; i++) {
      total += response[i].files.reduce((t, c) => t + c.size, 0);
    }

    setSpace((total / max)*100);
    setFiles(response.find(s => s.folder === cwd)?.files || []);

    let base = cwd;
    if(base === "/")
      base = "";

    let subfolders = response.map(s => s.folder).filter(f => f !== cwd && f.startsWith(cwd) && f.split("/").length === base.split("/").length + 1);
    setFolders(subfolders);
  }, [cwd, response]);

  React.useEffect(() => {
    update();
  }, [response, cwd, update]);

  const back = () => {
    setCwd(cwd.split("/").slice(0, -1).join("/") || "/");
  }

  const copyFile = (i) => {
    navigator.clipboard.writeText(process.env.REACT_APP_API_URL + "/file/" + files[i].code);
    setMessageOptions({body: "File URL copied to clipboard."});
  };

  const delFile = (i) => {
    setConfirmOptions({
      title: "Delete File",
      body: `Are you sure you want to delete ${files[i].filename}?`,
      submit: (status) => {
        if(status) {
          fetch(process.env.REACT_APP_API_URL + "/file/delete", {
            method: "POST",
            body: JSON.stringify({ code: files[i].code, folder: cwd }),
          }).then(r => r.json()).then(json => {
            if(json.success)
              setMessageOptions({body: json.response});
            else
              setErrorOptions({body: json.response});

            refresh();
          });
        }
      }
    });
  };

  const delFolder = (folder) => {
    setConfirmOptions({
      title: "Delete Folder",
      body: `Are you sure you want to delete ${folder.split("/").pop()}?`,
      submit: (status) => {
        if(status) {
          fetch(process.env.REACT_APP_API_URL + "/file/del_folder", {
            method: "POST",
            body: JSON.stringify({ folder }),
          }).then(r => r.json()).then(json => {
            if(json.success)
              setMessageOptions({body: json.response});
            else
              setErrorOptions({body: json.response});

            setCwd("/");
            refresh();
          });
        }
      }
    });
  }

  const upload = (files) => {
    if(files && files[0]) {
      setPleaseWaitOptions({isOpen: true});

      let file = files[0];

      let formData = new FormData();
      formData.append("file", file);
      formData.append("folder", cwd);

      fetch(process.env.REACT_APP_API_URL + "/file/upload", {
        method: 'POST',
        body: formData
      }).then(r => r.json()).then(json => {
        setPleaseWaitOptions({isOpen: false});

        if(json.success)
          setMessageOptions({body: json.response});
        else
          setErrorOptions({body: json.response});
        refresh();
      });
    }
  }

  const newFolder = (folder) => {
    let newPath = cwd.split("/").concat([folder.replace(/\//g, "").trim()]).join("/").replace(/\/\/+/g, '/');
    if(folder) {
      fetch(process.env.REACT_APP_API_URL + "/file/new_folder", {
        method: 'POST',
        body: JSON.stringify({ folder: newPath })
      }).then(r => r.json()).then(json => {
        if(json.success)
          setMessageOptions({body: json.response});
        else
          setErrorOptions({body: json.response});
        refresh();
      });
    }
  }

  // https://gist.github.com/yrq110/ebfc2cf66dae63f514bca22c62c40a93
  const humanFileSize = (size) => {
    let i = Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  }

  return (
    <>
      <Modal toggle={() => open(false)} isOpen={isOpen} className="modal-xl">
        <div className="modal-header">
          <h5 className="modal-title">
            {title}
          </h5>
          <button
            aria-label="Close"
            className="close"
            type="button"
            onClick={() => open(false)}
          >
            <span aria-hidden={true}>×</span>
          </button>
        </div>
        <div className="modal-body">
          <Container>
            <Row className="file-list-container">
              {cwd !== "/" && (
                <Row className="file-list-row w-100" style={{"cursor": "pointer"}} onClick={back}>
                  <Col className="file-list-icon">
                    <i className="fas fa-folder fa-4x"></i>
                  </Col>
                  <Col className="file-list-desc">
                    ..
                  </Col>
                </Row>
              )}
              {folders && folders.map((folder, i) => (
                <Row key={i} className="file-list-row w-100" style={{"cursor": "pointer"}} onClick={() => setCwd(folder)}>
                  <Col className="file-list-icon">
                    <i className="fas fa-folder fa-5x"></i>
                  </Col>
                  <Col className="file-list-desc">
                    {folder.split("/").pop()}
                    <div>
                      {submitFolder && (
                        <Button size="sm" color="info" onClick={() => {submitFolder(JSON.parse(JSON.stringify(response.filter(s => s.folder.startsWith(folder)))), folder); open(false);}}>Select</Button>
                      )} 
                      <Button size="sm" color="danger" onClick={(e) => {delFolder(folder); e.stopPropagation();}}><i className="fas fa-trash"></i></Button>
                    </div>
                  </Col>
                </Row>
              ))}
              {files && files.map((file, i) => (
                <Row key={i} className="file-list-row w-100">
                  <Col className="file-list-icon">
                    <FileIcon extension={file.filename.split('.').pop()} />
                  </Col>
                  <Col className="file-list-desc">
                    {file.filename} ({humanFileSize(file.size)})
                    <div>
                      {submit && (
                        <Button size="sm" color="info" onClick={() => {submit(files[i]); open(false);}}>Select</Button>
                      )}
                      <Button size="sm" color="info" onClick={() => copyFile(i)}><i className="fas fa-copy"></i></Button>
                      <Button size="sm" color="danger" onClick={() => delFile(i)}><i className="fas fa-trash"></i></Button>
                    </div>
                  </Col>
                </Row>
              ))}
              {(cwd === "/" && files && files.length >= 0 && submitFolder) && (
                <Button size="sm" color="info" onClick={() => {submitFolder(JSON.parse(JSON.stringify(response.filter(s => s.folder.startsWith(cwd)))), cwd); open(false);}}>Select /</Button>
              )}
            </Row>
            <Row>
              <Button size="sm" color="info" onClick={() => setDragDropOptions({submit: upload, multiple: false, key: Math.random()})}>Upload File</Button>
              <Button size="sm" color="danger" onClick={() => setInputOptions({submit: newFolder, title: "New Folder", body: "Enter new folder name:"})}>New Folder</Button>
            </Row>
            <Row>
              <div className="progress-container progress-danger w-100">
                <span className="progress-badge">Storage Remaining ({parseInt(128 * (1-(space / 100)))} / 128MB)</span>
                <Progress max="100" value={space}>
                  <span className="progress-value">{parseInt(space)}%</span>
                </Progress>
              </div>
            </Row>
          </Container>
        </div>
      </Modal>
    </>
  );
}

export default FileListModal;