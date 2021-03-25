import React from "react";
import {useDropzone} from 'react-dropzone';
// reactstrap components
import { 
  Input,
  Button,
  Modal,
  FormGroup
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
    fileRejections,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({multiple, maxSize});

  const acceptedFileItems = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
      <ul>
        {errors.map(e => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
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
              <p>Drag & Drop / Click Here</p>
              <p>Max Size: {maxSize/1024/1024} MB</p>
            </div>
            <br />
            <aside>
              {multiple ? <h6>Files</h6> : <h6>File</h6>}
              <ul>{acceptedFileItems}</ul>
            </aside>
          </div>
          <Button
            color="danger"
            type="button"
            className="float-right"
            onClick={() => finish(false)}
          >
            Close
          </Button>
          <Button
            color="success"
            type="button"
            className="float-right"
            onClick={() => finish(true)}
          >
            Submit
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default DragDropModal;