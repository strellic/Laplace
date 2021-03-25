import React from "react";
// reactstrap components
import { 
  Input,
  Button,
  Modal,
  FormGroup
} from "reactstrap";
// core components

function ImportModal({open, isOpen, submit}){
  const [json, setJson] = React.useState("");
  const finish = () => {
    submit(json);
    open(false);
    setJson("");
  };
  return (
    <>
      <Modal toggle={() => open(false)} isOpen={isOpen}>
        <div className="modal-header">
          <h5 className="modal-title">
            Input JSON data:
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
          <p>Enter JSON data below:</p>
          <FormGroup>
            <Input
              type="textarea"
              value={json}
              className="importTextarea"
              onChange={e => setJson(e.target.value)}
            ></Input>
          </FormGroup>
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
            Import
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default ImportModal;