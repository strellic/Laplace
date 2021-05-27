import React from "react";
// reactstrap components
import { 
  Input,
  Button,
  Modal,
  FormGroup,
  Row,
  Col,
  Label
} from "reactstrap";
// core components
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import Insert from "components/Markdown/Insert.js";
import ExternalMedia from "components/Markdown/ExternalMedia.js";

import markdownify from "utils/markdown.js";

import fetch from "utils/fetch.js";
import { useAlertState } from "context/alert.js";

function EditSection({open, isOpen, submit, section}){
  const { setFileListOptions, setSelectOptions, setErrorOptions } = useAlertState();

  const [title, setTitle] = React.useState(section.title || "");
  const [markdown, setMarkdown] = React.useState(section.markdown || "");
  const [type, setType] = React.useState(section.type || "info");

  const validTypes = ["info", "coding", "quiz", "flag", "website"];

  const [image, setImage] = React.useState(section.info?.image || {});

  const [checks, setChecks] = React.useState(section.coding?.checks || []);

  const [flag, setFlag] = React.useState(section.flag || "");

  const [question, setQuestion] = React.useState(section.quiz?.question || "");
  const [answers, setAnswers] = React.useState(section.quiz?.answers || []);
  const [all, setAll] = React.useState(section.quiz?.all || false);

  const [url, setURL] = React.useState("");
  const [autopass, setAutopass] = React.useState(true);

  const [files, setFiles] = React.useState(section.type === "coding" ? section.coding?.files || [] : []);

  const [langsList, setLangsList] = React.useState([]);
  const [lang, setLang] = React.useState("");

  const [layout, setLayout] = React.useState(section.layout || 0);

  React.useEffect(() => {
    if(!isOpen)
      return;

    fetch(process.env.REACT_APP_API_URL + "/code/langs")
    .then(r => r.json())
    .then(json => {
      let list = json.response;
      list.unshift({name: "All", lang: "All"});
      setLangsList(list);

      if(section.lang && list.find(l => l.lang === section.lang)) {
        setLang(list.find(l => l.lang === section.lang));
      }
      else {
        setLang(list[0]);
      }
    });
  }, [isOpen, section.lang]);

  React.useEffect(() => {
    if(type !== "info" && layout === 3)
      setLayout(0); 
  }, [type, layout]);

  const showLangModal = () => {
    setSelectOptions({
      title: "Select Language",
      body: "Select programming language below:",
      choices: langsList.map(l => l.name),
      submit: (name) => {
        if(!name)
          return;
        setLang(langsList.find(l => l.name === name));
      }
    });
  }

  MdEditor.use(Insert);
  MdEditor.use(ExternalMedia);

  const finish = async () => {
    let completed = {
      title,
      type,
      markdown,
      layout
    };

    switch(type) {
      case "info":
        completed.info = {
          image: image.code ? image : undefined
        };
        break;
      case "coding":
        completed.coding = {};
        if(lang.lang !== "All" && langsList.find(l => l === lang)) {
          completed.coding.lang = lang.lang;
        }
        completed.coding.checks = checks.map(c => ({...c, desc: undefined}));
        completed.coding.files = files;
        delete completed.layout;
        break;
      case "flag":
        completed.flag = flag;
        break;
      case "quiz":
        completed.quiz = {question, answers, all};
        break;
      case "website":
        try {
          let check = new URL(url);
          if(!["http:", "https:"].includes(check.protocol)) {
            return setErrorOptions({ body: "Invalid URL." });
          }
        }
        catch(err) {
          return setErrorOptions({ body: "Invalid URL." });
        }
        completed.website = {
            url,
            autopass
        };
        break;
      default:
        break;
    }
    if(section.code)
      completed.code = section.code;

    submit(completed);
    open(false);
  };

  const newCase = () => {
    setChecks([...checks, {stdin: "", stdout: "", hint: "", desc: "Test cases for programming challenges:"}]);
  }
  const newCode = () => {
  	setChecks([...checks, {code: "", output: "", hint: "", multiline: true, fail: false, desc: "Regex to verify the code and output:"}]);
  }

  const delCheck = () => {
    setChecks([...checks.slice(0, -1)]);
  }
  const updateCheck = (i, key, data) => {
    let modified = [...checks];
    modified[i][key] = data;
    setChecks(modified);
  }

  const newAns = () => {
    setAnswers([...answers, {choice: "", correct: false}]);
  }
  const delAns = () => {
    setAnswers([...answers.slice(0, -1)]);
  }
  const updateAns = (i, key, data) => {
    let modified = [...answers];
    modified[i][key] = data;
    setChecks(modified);
  }

  const setTemplate = (folders, base) => {
  	for(let i = 0; i < folders.length; i++)
  		folders[i].folder = folders[i].folder.slice(base.length) || "/";
  	setFiles(folders);
  }

  return (
    <>
      <Modal toggle={() => open(false)} isOpen={isOpen} className="modal-xl">
        <div className="modal-header">
          <h5 className="modal-title">
            Edit Section <strong>{section.title}</strong>:
            {section.code && (<p className="mb-0"><small>Section ID: {section.code}</small></p>)}
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
          <FormGroup>
            <label>Title</label>
            <Input
              placeholder="Enter title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
            ></Input>
          </FormGroup>
          <FormGroup>
            <MdEditor
              style={{ height: "500px" }}
              value={markdown}
              renderHTML={(text) => markdownify(text)}
              onChange={({html, text}) => setMarkdown(text)}
            />
          </FormGroup>
          {!["coding"].includes(type) && ( // only for sections with two columns
            <FormGroup>
              <label>Layout</label>
              <div className="d-flex">
                <div>
                  <Button className="p-2" color={layout === 0 ? "info" : "secondary"} onClick={() => setLayout(0)}>
                    <img alt="50 / 50" src={require("assets/img/section/layout0.png")} style={{"height": "4rem"}} />
                  </Button>
                </div>
                <div className="ml-3">
                  <Button className="p-2" color={layout === 1 ? "info" : "secondary"} onClick={() => setLayout(1)}>
                    <img alt="25 / 75" src={require("assets/img/section/layout1.png")} style={{"height": "4rem"}} />
                  </Button>
                </div>
                <div className="ml-3">
                  <Button className="p-2" color={layout === 2 ? "info" : "secondary"} onClick={() => setLayout(2)}>
                    <img alt="75 / 25" src={require("assets/img/section/layout2.png")} style={{"height": "4rem"}} />
                  </Button>
                </div>
                {type === "info" && (
                  <div className="ml-3">
                    <Button className="p-2" color={layout === 3 ? "info" : "secondary"} onClick={() => setLayout(3)}>
                      <img alt="75 / 25" src={require("assets/img/section/layout3.png")} style={{"height": "4rem"}} />
                    </Button>
                  </div>
                )}
              </div>
            </FormGroup>
          )}
          <FormGroup>
            <label>Section Type</label>
            <Input
              placeholder="Select section type"
              type="select"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              {validTypes.map((type, i) => <option key={i}>{type}</option>)}
            </Input>
          </FormGroup>
          {type === "info" && (
            <>
              {image && image.code ? (
                <>
                  <Button color="success" type="button" size="sm" onClick={() => setFileListOptions({title: "Select Image", submit: setImage, key: Math.random()})}>{image.filename}</Button>
                  <Button color="danger" type="button" size="sm" onClick={() => setImage(null)}>Remove Image</Button>
                </>
              ) : (
                <Button color="success" type="button" size="sm" onClick={() => setFileListOptions({title: "Select Image", submit: setImage, key: Math.random()})}>Set Image</Button>
              )}
            </>
          )}
          {type === "coding" && (
            <FormGroup>
              <label>Checks</label>
              {checks.map((check, i) => (<div key={i} className="mt-3">
              	{check.desc && (
                	<Row>
                		<Col>{check.desc}</Col>
                	</Row>
                )}
                <Row>
                	{Object.keys(check).filter(p => !["desc", "multiline", "fail", "hint"].includes(p) && p).map((prop, j) => (
                		<Col key={j}>
	                    <label>{prop} #{i + 1}</label>
	                    <Input
	                      type={(prop === "stdin" || prop === "stdout") ? "textarea" : "text"}
	                      className="testcase"
	                      placeholder={prop}
	                      value={check[prop]}
	                      onChange={e => updateCheck(i, prop, e.target.value)}
	                    />
	                  </Col>
                	))}
                </Row>
                <Row>
                  <Col>
                    <label>hint #{i + 1}</label>
                    <Input
                      type="text"
                      className="testcase"
                      placeholder="hint"
                      value={check.hint}
                      onChange={e => updateCheck(i, "hint", e.target.value)}
                    />
                  </Col>
                </Row>
                <Row>
                	{Object.keys(check).filter(p => ["multiline", "fail"].includes(p) && p).map((prop, j) => (
                		<Col key={j} className="ml-3">
	                    <Label check>
						            <Input
		                      type="checkbox"
		                      checked={check[prop]}
		                      onChange={e => updateCheck(i, prop, e.target.checked)}
		                    />{' '}
						           	{prop} #{i + 1}
						          </Label>
	                  </Col>
                	))}
                </Row>
              </div>))}
              <br />
              <Button color="info" type="button" size="sm" onClick={newCase}>+ Test Case</Button>
              <Button color="primary" type="button" size="sm" onClick={newCode}>+ Code Check</Button>
              {checks.length > 0 && (
                <Button color="danger" type="button" size="sm" onClick={delCheck}>-</Button>
              )}
            </FormGroup>
          )}
          {type === "flag" && (
            <FormGroup>
              <label>Flag</label>
              <Input
                placeholder="Enter flag"
                type="text"
                value={flag}
                onChange={e => setFlag(e.target.value)}
              />
            </FormGroup>
          )}
          {type === "quiz" && (
            <FormGroup>
              <label>Quiz Data</label>
              <Input 
                placeholder="Enter question"
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
              />
              {answers.map((answer, i) => <div key={`answer_${i}`}>
                <Row className="mt-3">
                  <Col>
                    <label>Answer #{i + 1}</label>
                    <Input
                      type="text"
                      placeholder="Answer"
                      value={answer.choice}
                      onChange={e => updateAns(i, "choice", e.target.value)}
                    />
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="checkbox"
                          checked={answer.correct}
                          onChange={e => updateAns(i, "correct", e.target.checked)}
                        />
                        <span className="form-check-sign"></span>
                        Correct
                      </Label>
                    </FormGroup>
                  </Col>
                </Row>
              </div>)}
              <br />
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={all}
                    onChange={e => setAll(e.target.checked)}
                  />
                  <span className="form-check-sign"></span>
                  Require All Correct Answers
                </Label>
              </FormGroup>
              <Button color="info" type="button" size="sm" onClick={newAns}>+</Button>
              <Button color="danger" type="button" size="sm" onClick={delAns}>-</Button>
            </FormGroup>
          )}

          {type === "coding" && (
          	<>
	          	{files && files.length !== 0 && (
	          		<div>
	          			{files.map((folder, i) => (
	          				<div key={i}>
	          					<i className="fas fa-folder"></i> {folder.folder}
	          					{folder.files.map((file, j) => (
	          						<div key={j} className="ml-3">
	          							<i className="fas fa-file"></i> <a target="_blank" rel="noopener noreferrer" href={process.env.REACT_APP_API_URL + "/file/" + file.code}>{file.filename}</a>
	          						</div>
	          					))}
	          				</div>
	          			))}
                  <div>
	          			  <Button color="danger" type="button" size="sm" onClick={() => setFiles([])}>Remove Files</Button>
                  </div>
	          		</div>
	          	)}
          		<Button color="success" type="button" size="sm" onClick={() => setFileListOptions({title: "Select Folder", submitFolder: setTemplate, key: Math.random()})}>Set Template Files</Button>
          	</>
          )}

          {type === "website" && (
            <Row>
              <Col>
                <label>Website URL</label>
                <Input
                  type="text"
                  placeholder="URL"
                  value={url}
                  onChange={e => setURL(e.target.value)}
                  required
                />
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={autopass}
                      onChange={e => setAutopass(e.target.checked)}
                    />
                    <span className="form-check-sign"></span>
                    Autopass
                  </Label>
                </FormGroup>
                {!autopass && (
                  <div>Run the JS snippet <code>window.parent.postMessage("finish", "*");</code> to finish the section.</div>
                )}
              </Col>
            </Row>
          )}

          <Button color="info" type="button" size="sm" onClick={() => setFileListOptions({title: "File Manager", key: Math.random()})}>File Manager</Button>
          
          {type === "coding" && <Button color="warning" type="button" size="sm" onClick={showLangModal}>Language: {lang.name}</Button>}
        </div>

        <div className="modal-footer">
          <Button
            color="danger"
            type="button"
            onClick={() => open(false)}
          >
            Close
          </Button>
          <Button
            color="info"
            type="button"
            onClick={finish}
          >
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default EditSection;