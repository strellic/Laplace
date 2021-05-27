import React from "react";
// reactstrap components
import { 
  Input,
  Button,
  Modal,
  FormGroup
} from "reactstrap";
// core components

function SelectModal({open, isOpen, submit, title="Select Choice", body="Select choice below:", button="Select", choices}){
  const [data, setData] = React.useState("");
  const finish = () => {
    submit(data || choices[0]);
    open(false);
  };
  return (
    <>
      <Modal toggle={() => open(false)} isOpen={isOpen}>
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
          <p>{body}</p>
          <FormGroup>
            <Input
              type="select"
              value={data}
              onChange={e => setData(e.target.value)}
            >
              {choices && choices.map((type, i) => <option key={i}>{type}</option>)}
            </Input>
          </FormGroup>
        </div>
        <div className="modal-footer justify-content-end">
          <Button
            color="info"
            type="button"
            onClick={finish}
            className="mr-2"
          >
            {button}
          </Button>
          <Button
            color="danger"
            type="button"
            onClick={() => open(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default SelectModal;