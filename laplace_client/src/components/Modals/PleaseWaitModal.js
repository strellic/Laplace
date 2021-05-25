import React from "react";
// reactstrap components
import { 
  Modal,
  Spinner
} from "reactstrap";
// core components

function PleaseWaitModal({open, title = "Please Wait...", isOpen}){
  const finish = () => {
    open(false);
  };  

  return (
    <>
      <Modal toggle={finish} isOpen={isOpen}>
        <div className="modal-header">
          <h5 className="modal-title">
            {title}
          </h5>
        </div>
        <div className="modal-body">
          <Spinner />
        </div>
      </Modal>
    </>
  );
}

export default PleaseWaitModal;