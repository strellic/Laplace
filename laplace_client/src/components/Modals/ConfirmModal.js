import React from "react";
// reactstrap components
import { 
  Button,
  Modal,
} from "reactstrap";
// core components

function ConfirmModal({open, isOpen, submit, yes = "OK", no = "Cancel", yesColor="info", noColor="danger", title, body}){
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
        </div>
        <div className="modal-footer justify-content-end">
          <Button
            color={yesColor}
            type="button"
            onClick={() => {open(false); submit(true)}}
            className="mr-2"
          >
            {yes}
          </Button>
          <Button
            color={noColor}
            type="button"
            onClick={() => {open(false); submit(false)}}
          >
            {no}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default ConfirmModal;