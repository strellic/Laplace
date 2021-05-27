import React from "react";
import {Controlled as CodeMirror} from 'react-codemirror2';
import { useHistory } from "react-router-dom";

import {
  Col,
  Spinner,
  Button,
  UncontrolledTooltip,
  Badge
} from "reactstrap";

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/rust/rust';

import IDEFiles from "components/IDE/IDEFiles.js";

import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";

import storage from "utils/storage.js";
import fetch from "utils/fetch.js";

function IDE({navbarRef, checks, storageKey = null, useFileStorage = false, room, section, files, lang, collabCode, base, size="normal", onSave = () => {}, onComplete = () => {}}) {
  const history = useHistory();
  const { isSignedIn, token } = useAuthState();
  const { setInputOptions, setConfirmOptions, setSelectOptions, setErrorOptions } = useAlertState();

  const [status, setStatus] = React.useState("disconnected");
  const [ws, setWS] = React.useState(null);
  const connectWS = React.useCallback(() => {
    if(ws && [WebSocket.OPEN, WebSocket.CONNECTING].includes(ws.readyState)) {
      return;
    }

    let socket = new WebSocket(process.env.REACT_APP_API_URL.replace("https", "wss").replace("http", "ws") + "/ws");

    socket.onopen = () => {
      if(status === "disconnected")
        setStatus("connected");
    }
    socket.onclose = () => {
      setStatus("disconnected");
    }
    setWS(socket);

    return () => {
      ws.close();
    };
  }, [ws, status]);

  React.useEffect(() => {
    connectWS();
  }, [connectWS]);

  const [active, setActive] = React.useState({
    files: [],
    folder: "/",
    file: {},
    sideFolder: "",
    lang: {},
    open: [],
    output: [],
    input: "",
    loaded: false
  });

  const transferred = React.useRef(false);
  const [collab, setCollab] = React.useState(false);
  const [count, setCount] = React.useState(0);

  const [languages, setLanguages] = React.useState([]);

  const codeBottomRef = React.createRef();
  const codeTopRef = React.createRef();

  const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  }

  React.useEffect(() => {
    if(!ws)
      return;

    ws.onmessage = function (event) {
      let data = JSON.parse(event.data);

      if(data.count)
        setCount(data.count);

      if(data.type === "stdout") {
        if(!data.msg.startsWith("[Task]"))
          setStatus("connected");
        setActive(prev => ({...prev, output: prev.output.concat([{type: "stdout", content: data.msg}])}));
      }
      else if(data.type === "stderr") {
        if(!data.msg.startsWith("[Task]"))
          setStatus("connected");
        setActive(prev => ({...prev, output: prev.output.concat([{type: "stderr", content: data.msg}])}));
      }
      else if(data.type === "pending") {
        setStatus("pending");
      }
      else if(data.type === "completed") {
        onComplete();
      }
      else if(data.type === "collab") {
        setCollab(true);
        if(data.meta === "error") {
          setErrorOptions({body: data.msg, submit: () => history.push("/home")});
        }
        else if(data.meta === "create") {
          setInputOptions({value: window.location.origin + "/ide?collab=" + data.msg, title: "Collab URL", body: "Send this URL to someone you want to share your code with."});
        }
        else if(data.meta === "update") {
          if(data.msg)
            setActive(data.msg);
          transferred.current = true;
        }
        else if(data.meta === "please_update") {
          setActive(prev => ({...prev, key: Math.random()}));
        }
      }
    }
  }, [ws, history, onComplete, setErrorOptions, setInputOptions]);

  React.useEffect(() => {
    if(!section || !collab || status === "disconnected")
      return;
    ws.send(JSON.stringify({
      type: "collab",
      meta: "leave"
    }))
  }, [collab, status, ws, section]);

  React.useEffect(() => {
    if(status === "connected" && collabCode && !collab) {
      setCollab(true);
      ws.send(JSON.stringify({
        type: "collab",
        meta: "join",
        code: collabCode
      }));
    }
  }, [collab, status, collabCode, ws]);

  const syntaxTable = {
    'python': 'text/x-python',
    'node': 'text/javascript',
    'java': 'text/x-java',
    'c': 'text/x-csrc',
    'c++': 'text/x-c++src',
    'c#': 'text/x-csharp',
    "rust": 'text/x-rustsrc'
  }

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + "/code/langs")
    .then(resp => resp.json())
    .then(async (json) => {
      if(json.success) {
        let langs = json.response;
        if(lang) {
          langs = [json.response.find(l => l.lang === lang)];
        }

        const loadFiles = async () => {
          for(let location of files) {
            for(let i = 0; i < location.files.length; i++) {
              if(!location.folder.endsWith("/"))
                location.folder += "/";
              location.files[i].content = await (await fetch(process.env.REACT_APP_API_URL + "/file/" + location.files[i].code)).text();
            }
          }
          return files;
        }

        if(files && files.length !== 0) {
          let data = await loadFiles();
          for(let i = 0; i < langs.length; i++) {
            langs[i].template = data;
          }
        }
        setLanguages(langs);

        if(collabCode)
          return;

        if(!useFileStorage && storageKey && storage.load(storageKey)) {
          let saved = storage.load(storageKey);
          setActive({...saved, lang: langs.find(l => l.lang === saved.lang.lang), output: [], input: "", loaded: true});
        }
        else {
          let lang = langs[0];
          let open = [];
          if(lang.template[0].files[0]) {
            open = [
              {filename: lang.template[0].files[0].filename, folder: lang.template[0].folder}
            ];
          }
          let start = null;

          if(lang.template[0].files[0])
            start = clone(lang.template[0].files[0]);

          setActive({
            files: clone(lang.template),
            folder: "/",
            file: start,
            lang: lang,
            open,
            output: [],
            input: "",
            loaded: true,
            sideFolder: ""
          });
        }
      }
      else {
        history.push("/home");
      }
    });
  }, [files, history, collabCode, lang, storageKey, useFileStorage]);

  React.useEffect(() => {
    function handleResize() {
      if(navbarRef.current && codeBottomRef.current && codeTopRef.current) {
        let height = window.innerHeight;

        height -= navbarRef.current.parentElement.parentElement.offsetHeight;
        height -= codeBottomRef.current.offsetHeight;
        height -= codeTopRef.current.offsetHeight;

        let prevHeight = document.getElementsByClassName("react-codemirror2")[0].style.height;
        if(Math.abs(height - parseInt(prevHeight)) < 10) {
          // skip resizing unless large height difference
          return;
        }

        height += "px";

        document.getElementsByClassName("react-codemirror2")[0].style.height = height;
        document.getElementsByClassName("CodeMirror cm-s-material")[0].style.height = height;
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [navbarRef, codeBottomRef, codeTopRef]);

  React.useEffect(() => {
    if(!useFileStorage && storageKey && active && active.loaded && active.file && active.files) {
      // if(JSON.stringify(active.lang.template) !== JSON.stringify(active.files))
      // not sure if i want this check to be active or not...
      storage.save(storageKey, active);
    }

    if(collab && status !== "disconnected" && !transferred.current) {
      ws.send(JSON.stringify({
        type: "collab",
        meta: "update",
        msg: active
      }));
    }
    transferred.current = false;
  }, [active, collab, status, storageKey, ws, useFileStorage]);

  const run = () => {
    setActive(prev => ({...prev, output: []}));

    ws.send(JSON.stringify({
      type: "run",
      files: active.files,
      input: active.input,
      lang: active.lang.lang
    }));
  };

  const check = () => {
    if(room && section && isSignedIn) {
      setActive(prev => ({...prev, output: []}));

      ws.send(JSON.stringify({
        type: "check",
        room,
        section,
        token,
        files: active.files,
        lang: active.lang.lang,
      }));
    }
  }

  const stdinChange = () => {
    setInputOptions({
      title: "Set Input",
      body: "Enter program input (stdin) below:",
      type: "textarea",
      value: active.input,
      submit: (input) => setActive(prev => ({...prev, input}))
    });
  }

  const langChange = () => {
    setSelectOptions({
      title: "Select Language",
      body: "Select programming language below:",
      choices: languages.map(lang => lang.name),
      submit: (name) => {
        if(!name)
          return;

        let lang = languages.find(check => check.name === name);

        setActive(prev => ({
          ...prev,
          files: clone(lang.template),
          folder: "/",
          file: clone(lang.template[0].files[0]),
          lang: lang,
          open: [
            {filename: lang.template[0].files[0].filename, folder: lang.template[0].folder}
          ],
          loaded: true,
          sideFolder: ""
        }));
      }
    });
  }

  const resetAlert = () => {
    setConfirmOptions({
      title: "Reset",
      body: "Do you want to reset your code?",
      submit: (status) => {
        if(status) {
          setActive(prev => ({
            ...prev,
            files: clone(active.lang.template),
            folder: "/",
            file: clone(active.lang.template[0].files[0]),
            lang: active.lang,
            open: [
              {filename: active.lang.template[0].files[0].filename, folder: active.lang.template[0].folder}
            ],
            loaded: true,
            sideFolder: ""
          }));
        }
      }
    })
  }

  const collabStart = () => {
    ws.send(JSON.stringify({
      type: "collab",
      meta: "create"
    }));
    setCollab(true);
  }

  return (
    <>
      <Col sm="12" className={size === "normal" ? "col-md-4 ide" : "col-md-6 ide"}>
        <div className="ide-top-files" ref={codeTopRef}>
          <IDEFiles active={active} setActive={setActive} size={size} />
        </div>
        {(active.file && active.lang) ? (
          <CodeMirror
            value={active.file.content}
            options={{
              mode: active.lang ? syntaxTable[active.lang.lang] : "text/x-python",
              theme: 'material',
              lineNumbers: true,
              lineWrapping: true
            }}
            onBeforeChange={(editor, data, value) => {
              let file = {...active.file, content: value};
              let files = active.files;

              let location = active.files.findIndex(f => f.folder === active.folder);
              if(location !== -1) {
                let index = active.files[location].files.findIndex(f => f.filename === active.file.filename);
                files[location].files[index] = file;

                setActive({...active, file, files});
              }
            }}
          />
        ) : (
          <div className="react-codemirror2 CodeMirror cm-s-material"></div>
        )}
        <div className="ide-bottom" ref={codeBottomRef}>
          {status === "disconnected" ? (
            <Button size="sm" color="danger" onClick={connectWS} className="m-0">Reconnect</Button>
          ) : (
            <div>
              <Button disabled={status !== "connected"} id="ide-run" className="m-0" color="success" type="button" size="sm" onClick={run}><i className="fas fa-play"></i></Button>
              <UncontrolledTooltip placement="top" target="ide-run">Run</UncontrolledTooltip>

              <Button id="ide-reset" className="m-0 ml-2" color="info" type="button" size="sm" onClick={resetAlert}><i className="fas fa-sync-alt"></i></Button>
              <UncontrolledTooltip placement="top" target="ide-reset">Reset</UncontrolledTooltip>

              <Button id="ide-input" className="m-0 ml-2" color="warning" type="button" size="sm" onClick={stdinChange}><i className="fas fa-pencil-alt"></i></Button>
              <UncontrolledTooltip placement="top" target="ide-input">Input</UncontrolledTooltip>

              {(languages && languages.length > 1) && (
                <>
                  <Button id="ide-language" className="m-0 ml-2" color="default" type="button" size="sm" onClick={langChange}><i className="fas fa-code"></i></Button>
                  <UncontrolledTooltip placement="top" target="ide-language">{active.lang ? active.lang.name : "Loading..."}</UncontrolledTooltip>
                </>
              )}

              {checks && (
                <>
                  <Button disabled={status !== "connected"} id="ide-check" className="m-0 ml-2 float-right" color="danger" type="button" size="sm" onClick={check}><i className="fas fa-check"></i></Button>
                  <UncontrolledTooltip placement="top" target="ide-check">Check</UncontrolledTooltip>
                </>
              )}
              {(useFileStorage && !collabCode && base) && (
                <>
                  <Button id="ide-save" className="m-0 ml-2 float-right" color="danger" type="button" size="sm" onClick={() => onSave(clone(active.files))}><i className="fas fa-save"></i></Button>
                  <UncontrolledTooltip placement="top" target="ide-save">Save</UncontrolledTooltip>
                </>
              )}
              <Button id="ide-collab" disabled={collab} className="m-0 ml-2 float-right" color="primary" type="button" size="sm" onClick={collabStart}>{collab && <>{count} </>}<i className="fas fa-code-branch"></i></Button>
              <UncontrolledTooltip placement="top" target="ide-collab">Collab</UncontrolledTooltip>
            </div>
          )}
        </div>
      </Col>
      <Col sm="12" className={size === "normal" ? "col-md-4 room-output p-0" : "col-md-6 room-output p-0"}>
        <div className="ide-top">
          {active.lang && active.lang.name ? active.lang.name : "Loading..."}
          {status === "connected" && <Badge color="success" className="m-0 mr-2 ide-badge float-right">Connected<i className="fas fa-check ml-2"></i></Badge>}
          {status === "pending" && <Badge color="warning" className="m-0 mr-2 ide-badge float-right">Sending<Spinner size="sm" type="grow" className="ml-2 ide-grow" /></Badge>}
          {status === "disconnected" && <Badge color="danger" className="m-0 mr-2 ide-badge float-right">Disconnected<i className="fas fa-times ml-2"></i></Badge>}
        </div>
        <div className="p-3 room-terminal">
          {active.output && active.output.map((message, i) => (
            message.type === "stdout" ? <div key={i}>{message.content}</div> : <div key={i} className="room-output-error">{message.content}</div>
          ))}
        </div>
      </Col>
    </>
  );
}

export default IDE;