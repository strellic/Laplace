import React from "react";
// reactstrap components
import { 
  Button,
  Modal,
} from "reactstrap";
// core components

function ExportModal({open, isOpen, data}){
  return (
    <>
      <Modal toggle={() => open(false)} isOpen={isOpen}>
        <div className="modal-header">
          <h5 className="modal-title">
            Copy JSON data:
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
          <pre>{data}</pre>
        </div>
        <div className="modal-footer justify-content-end">
          <Button
            color="info"
            type="button"
            onClick={() => navigator.clipboard.writeText(data) && open(false)}
            className="mr-2"
          >
            Copy
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

export default ExportModal;