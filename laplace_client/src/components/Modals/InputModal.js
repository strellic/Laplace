import React from "react";
// reactstrap components
import { 
  Input,
  Button,
  Modal,
  FormGroup
} from "reactstrap";
// core components

function InputModal({open, isOpen, submit, title="Input Data", body="Enter data below:", type="text", button="Save", reset=true, value=""}){
  const [data, setData] = React.useState(value);
  const finish = () => {
    submit(data);
    open(false);

    if(reset)
      setData("");
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
              type={type}
              value={data || value}
              onChange={e => setData(e.target.value)}
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
          {submit && (
            <Button
              color="info"
              type="button"
              onClick={finish}
            >
              {button}
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}

export default InputModal;