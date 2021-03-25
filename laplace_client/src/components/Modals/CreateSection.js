import React from "react";
// reactstrap components
import { 
  Input,
  Button,
  Modal,
  FormGroup
} from "reactstrap";
// core components

function CreateSection({open, isOpen, submit}){
  const [title, setTitle] = React.useState("");

  const finish = () => {
    submit({title});
    open(false);
    setTitle("");
  };

  return (
    <>
      <Modal toggle={() => open(false)} isOpen={isOpen}>
        <div className="modal-header">
          <h5 className="modal-title">
            Create Section
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
          <p>Enter section details:</p>
          <FormGroup>
            <Input
              placeholder="Enter title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
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
            Create
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default CreateSection;