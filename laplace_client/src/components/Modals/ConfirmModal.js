import React from "react";
// reactstrap components
import { 
  Button,
  Modal,
} from "reactstrap";
// core components

function ConfirmModal({open, isOpen, submit, yes = "Yes", no = "No", title, body}){
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
        <div className="mb-1 mr-4">
          <Button
            color="danger"
            type="button"
            className="float-right"
            onClick={() => {open(false); submit(false)}}
          >
            {no}
          </Button>
          <Button
            color="success"
            type="button"
            className="float-right"
            onClick={() => {open(false); submit(true)}}
          >
            {yes}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default ConfirmModal;