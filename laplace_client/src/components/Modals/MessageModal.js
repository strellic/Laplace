import React from "react";
// reactstrap components
import { 
  Button,
  Modal,
} from "reactstrap";
// core components

function MessageModal({open, isOpen, title, body, submit}){
  const finish = () => {
    if(submit)
      submit();
    open(false);
  };
  return (
    <>
      <Modal toggle={() => open(false)} isOpen={isOpen}>
        <div className="modal-header">
          <h5 className="modal-title">
            {title ? title : "Success"}
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
        </div>
        <div className="modal-footer justify-content-end">
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

export default MessageModal;