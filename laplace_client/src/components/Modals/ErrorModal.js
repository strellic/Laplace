import React from "react";
// reactstrap components
import { 
  Button,
  Modal,
} from "reactstrap";
// core components

function ErrorModal({open, isOpen, body, submit}){
  const finish = () => {
    if(submit)
      submit();
    open(false);
  };
  return (
    <>
      <Modal toggle={finish} isOpen={isOpen}>
        <div className="modal-header">
          <h5 className="modal-title">
            Error
          </h5>
          <button
            aria-label="Close"
            className="close"
            type="button"
            onClick={submit}
          >
            <span aria-hidden={true}>×</span>
          </button>
        </div>
        <div className="modal-body">
          <p>{body}</p>
        </div>
        <div className="modal-footer">
          <Button
            color="danger"
            type="button"
            onClick={finish}
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default ErrorModal;