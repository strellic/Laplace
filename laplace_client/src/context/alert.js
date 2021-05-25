import React from 'react'

import InputModal from "components/Modals/InputModal.js";
import ConfirmModal from "components/Modals/ConfirmModal.js";
import MessageModal from "components/Modals/MessageModal.js";
import ErrorModal from "components/Modals/ErrorModal.js";
import SelectModal from "components/Modals/SelectModal.js";
import DragDropModal from "components/Modals/DragDropModal.js";
import FileListModal from "components/Modals/FileListModal.js";
import PleaseWaitModal from "components/Modals/PleaseWaitModal.js";

const AlertContext = React.createContext();

function AlertProvider({children}) {
  const [inputOptions, setInputOptions] = React.useState({});
  const [inputModal, setInputModal] = React.useState(null);

  const [confirmOptions, setConfirmOptions] = React.useState({});
  const [confirmModal, setConfirmModal] = React.useState(null);

  const [messageOptions, setMessageOptions] = React.useState({});
  const [messageModal, setMessageModal] = React.useState(null); 

  const [errorOptions, setErrorOptions] = React.useState({});
  const [errorModal, setErrorModal] = React.useState(null); 

  const [selectOptions, setSelectOptions] = React.useState({});
  const [selectModal, setSelectModal] = React.useState(null); 

  const [dragDropOptions, setDragDropOptions] = React.useState({});
  const [dragDropModal, setDragDropModal] = React.useState(null); 

  const [fileListOptions, setFileListOptions] = React.useState({});
  const [fileListModal, setFileListModal] = React.useState(null);

  const [pleaseWaitOptions, setPleaseWaitOptions] = React.useState({});
  const [pleaseWaitModal, setPleaseWaitModal] = React.useState(null);

  React.useEffect(() => {
    if(Object.keys(inputOptions).length)
      setInputModal(true);
  }, [inputOptions]);
  React.useEffect(() => {
    if(Object.keys(confirmOptions).length)
      setConfirmModal(true);
  }, [confirmOptions]);
  React.useEffect(() => {
    if(Object.keys(messageOptions).length)
      setMessageModal(true);
  }, [messageOptions]);
  React.useEffect(() => {
    if(Object.keys(errorOptions).length)
      setErrorModal(true);
  }, [errorOptions]);
  React.useEffect(() => {
    if(Object.keys(selectOptions).length)
      setSelectModal(true);
  }, [selectOptions]);
  React.useEffect(() => {
    if(Object.keys(dragDropOptions).length)
      setDragDropModal(true);
  }, [dragDropOptions]);
  React.useEffect(() => {
    if(Object.keys(fileListOptions).length)
      setFileListModal(true);
  }, [fileListOptions]);
  React.useEffect(() => {
    if(Object.keys(pleaseWaitOptions).length)
      setPleaseWaitModal(true);
  }, [pleaseWaitOptions]);

  const state = {
    setInputOptions,
    setConfirmOptions,
    setMessageOptions,
    setErrorOptions,
    setSelectOptions,
    setDragDropOptions,
    setFileListOptions,
    setPleaseWaitOptions
  }

  return (
    <AlertContext.Provider value={state}>
      <InputModal open={setInputModal} isOpen={inputModal} {...inputOptions} />
      <ConfirmModal open={setConfirmModal} isOpen={confirmModal} {...confirmOptions} />
      <MessageModal open={setMessageModal} isOpen={messageModal} {...messageOptions} />
      <ErrorModal open={setErrorModal} isOpen={errorModal} {...errorOptions} />
      <SelectModal open={setSelectModal} isOpen={selectModal} {...selectOptions} />
      <DragDropModal open={setDragDropModal} isOpen={dragDropModal} {...dragDropOptions} />
      <FileListModal open={setFileListModal} isOpen={fileListModal} {...fileListOptions} />
      <PleaseWaitModal open={setPleaseWaitModal} isOpen={pleaseWaitModal} {...pleaseWaitOptions} />
      {children}
    </AlertContext.Provider>
  )
}

function useAlertState() {
  return React.useContext(AlertContext);
}

export { AlertProvider, useAlertState };