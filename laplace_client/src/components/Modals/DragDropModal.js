import React from "react";
import {useDropzone} from 'react-dropzone';
// reactstrap components
import { 
  Button,
  Modal
} from "reactstrap";
// core components

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const activeStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

function DragDropModal({open, isOpen, submit, title="Upload Files", type="text", button="Save", multiple=true, maxSize=8*1024*1024}){
  let {
    getRootProps,
    getInputProps,
    acceptedFiles,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({multiple, maxSize});

  const acceptedFileItems = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const style = React.useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  const finish = (status) => {
    open(false);

    if(status)
      submit(acceptedFiles);
    else
      submit([]);
  }

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
          <div className="container">
            <div {...getRootProps({style})}>
              <input {...getInputProps()} />
              <p className="text-center">Drag & Drop / Click Here<br />
                 Max Size: {maxSize/1024/1024} MB</p>
            </div>
            <br />
            <aside>
              {multiple ? <h6>Files:</h6> : <h6>File:</h6>}
              <ul>{acceptedFileItems}</ul>
            </aside>
          </div>
        </div>
        <div className="modal-footer justify-content-end">
          <Button
            color="info"
            type="button"
            className="mr-2"
            onClick={() => finish(true)}
          >
            Submit
          </Button>
          <Button
            color="danger"
            type="button"
            onClick={() => finish(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default DragDropModal;