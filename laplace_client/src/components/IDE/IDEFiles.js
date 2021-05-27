import React from "react";

import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
}
from "reactstrap";

import { useAlertState } from "context/alert.js";

function IDEFiles({active, setActive, size}) {
  const { setInputOptions, setConfirmOptions, setDragDropOptions } = useAlertState();

  const [sideOpen, setSideOpen] = React.useState(false);

  const SideFiles = (folder, padding, isFolder) => {
    return active.files.find(f => f.folder === folder).files.sort((a, b) => a.filename.localeCompare(b.filename)).map((file, i) => {
      let isSelected = active.file && file.filename === active.file.filename && isFolder;

      return (
        <div key={i} className="ide-file-sidecontainer">
          <div
            style={{'paddingLeft': (padding + 1.0) + 'rem'}}
            onClick={() => {addOpen({filename: file.filename, folder}); setSideOpen(false)}}
            className="ide-file-sidefile"
          >
            {isSelected && <i className="fas fa-arrow-right mr-2"></i>}<i className="fas fa-file mr-2"></i>{file.filename}
          </div>
          <UncontrolledDropdown className="ide-file-sidefile-context">
            <DropdownToggle caret>
              <i className="fas fa-ellipsis-h"></i>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => deleteFile(file.filename, folder)}>Delete</DropdownItem>
              <DropdownItem onClick={() => renameFile(file.filename, folder)}>Rename</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      );
    });
  };

  const SideFolder = (pathName, key, showFolder = true) => {
    let path = pathName.split("/").slice(0,-1);

    let isFolder = pathName === active.folder;
    let isSideFolder = pathName === active.sideFolder;

    let folderClass = "ide-file-sidefile" + (isSideFolder ? " ide-file-selected" : "");
    let padding = (path.length - 1) * 1.0;

    if(!showFolder)
      return SideFiles(pathName, 0, isFolder);

    return (
      <div key={key}>
        <div className="ide-file-sidecontainer">
          <div className={folderClass} 
            onClick={() => setActive({...active, sideFolder: isSideFolder ? "" : pathName})}
            style={{'paddingLeft': padding+'rem'}}
          >
            <i className="fas fa-folder mr-2"></i>{path[path.length-1]}
          </div>
          <UncontrolledDropdown className="ide-file-sidefile-context">
            <DropdownToggle caret>
              <i className="fas fa-ellipsis-h"></i>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => deleteFolder(pathName)}>Delete</DropdownItem>
              <DropdownItem onClick={() => renameFolder(pathName)}>Rename</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
        {SideFiles(pathName, padding, isFolder)}
      </div>
    )
  }

  const openToFile = (open) => {
    return (active.files.find(f => f.folder === open.folder).files || []).find(f => f.filename === open.filename);
  }

  const addOpen = (tab) => {
    let newOpen = [...active.open];

    if(!newOpen.find(o => o.filename === tab.filename && o.folder === tab.folder))
      newOpen.push({filename: tab.filename, folder: tab.folder});

    setActive({...active, open: newOpen, file: openToFile(tab), folder: tab.folder});
  }

  const removeOpen = (tab) => {
    let newTabs = active.open.filter(o => o.folder !== tab.folder || o.filename !== tab.filename);

    if(active.file && active.file.filename === tab.filename && active.folder === tab.folder) {
      if(newTabs[0])
        setActive({...active, open: newTabs, file: openToFile(newTabs[0]), folder: newTabs[0].folder});
      else
        setActive({...active, open: newTabs, file: null, folder: null});
      
      return;
    }

    setActive({...active, open: newTabs});
  }

  const deleteFile = (name, folder) => {
    let callback = (status) => {
      if(!status)
        return;

      let newActive = {...active};
      let index = active.files.find(f => f.folder === folder).files.findIndex(f => f.filename === name);

      newActive.files.find(f => f.folder === folder).files.splice(index, 1);

      let index2 = newActive.open.findIndex(o => o.filename === name && o.folder === folder);
      if(index2 !== -1)
        newActive.open.splice(index2, 1);

      if(active.file && active.file.filename === name && active.folder === folder) {
        newActive.file = newActive.open[0] ? openToFile(newActive.open[0]) : null;
        newActive.folder = newActive.open[0] ? newActive.open[0].folder : null;
      }

      setActive(newActive);
    }
    setConfirmOptions({
      title: "Delete File",
      body: "Are you sure you want to delete the file?",
      submit: callback,
    });
  }

  const renameFile = (name, folder) => {
    let callback = (newName) => {
      let newActive = {...active};
      let location = active.files.findIndex(f => f.folder === folder);
       let index = active.files[location].files.findIndex(f => f.filename === name);

       newActive.files[location].files[index] = {...active.files[location].files[index], filename: newName};

       let index2 = newActive.open.findIndex(o => o.filename === name && o.folder === folder);
       if(index2 !== -1)
        newActive.open[index2] = {filename: newName, folder: folder};

      if(active.file && active.file.filename === name && active.folder === folder) {
         newActive.file = {...active.files[location].files[index], filename: newName};
       }

       setActive(newActive);
    }
    setInputOptions({
      title: "Rename File",
      body: "Enter new name below:",
      type: "input",
      value: name,
      submit: callback,
    });
  }

  const deleteFolder = (pathName) => {
    let callback = (status) => {
      if(!status)
        return;

      let newActive = {...active};
      delete newActive.files[active.files.findIndex(f => f.folder === pathName)];
      newActive.files = newActive.files.filter(f => f);

      if(active.folder === pathName) {
        newActive.file = null;
         newActive.folder = null;
       }

      for(let i = newActive.open.length - 1; i >= 0; i--) {
        if(newActive.open[i].folder === pathName) {
          newActive.open.splice(i, 1);
        }
      }
      if(newActive.open.length !== active.open.length) {
        newActive.file = newActive.open[0] ? openToFile(newActive.open[0]) : null;
        newActive.folder = newActive.open[0] ? newActive.open[0].folder : null;
      }

      if(active.sideFolder === pathName)
        newActive.sideFolder = "";

      setActive(newActive);
    }
    setConfirmOptions({
      title: "Delete Folder",
      body: "Are you sure you want to delete the folder?",
      submit: callback,
    });
  }

  const renameFolder = (pathName) => {
    let callback = (newName) => {
      let path = pathName.split("/").slice(0,-1);
      path[path.length - 1] = newName.replaceAll("/", "");
      newName = path.join("/");

      if(!newName.startsWith("/"))
        newName = "/" + newName;
      if(!newName.endsWith("/"))
        newName = newName + "/";

      let newActive = {...active};
      newActive.files[active.files.findIndex(f => f.folder === pathName)].folder = newName;

      if(active.folder === pathName)
        newActive.folder = newName;

      for(let i = newActive.open.length - 1; i >= 0; i--) {
        if(newActive.open[i].folder === pathName) {
          newActive.open[i].folder = newName;
        }
      }
      
      if(active.sideFolder === pathName)
        newActive.sideFolder = newName;

      setActive(newActive);
    }
    setInputOptions({
      title: "Rename Folder",
      body: "Enter new name below:",
      type: "input",
      value: pathName.split("/")[pathName.split("/").length - 2],
      submit: callback,
    });
  }

  const newFile = (name, content = "") => {
    let folder = active.sideFolder || "/";
    name = name.replaceAll("/", "");
    if(active.files.find(f => f.folder === folder).files.find(f => f.filename === name)) {
      return;
    }
    let files = active.files;
    files.find(f => f.folder === folder).files.push({
      filename: name,
      content
    });
    setActive({...active, files});
  }

  const uploadFile = () => {
    setDragDropOptions({
      title: "Upload File",
      body: "Upload the file below:",
      submit: (uploaded) => {
        uploaded.forEach((file) => {
          const reader = new FileReader();
          reader.onabort = () => console.log('file reading was aborted');
          reader.onerror = () => console.log('file reading has failed');
          reader.onload = () => {
            newFile(file.name, reader.result);
          }
          reader.readAsBinaryString(file);
        });
      },
      key: Math.random()
    });
  }

  const newFileDialog = () => {
    setInputOptions({
      title: "New File",
      body: "Enter new file name:",
      type: "input",
      button: "Create",
      reset: true,
      submit: newFile 
    })
  }

  const newFolderDialog = () => {
    setInputOptions({
      title: "New Folder",
      body: "Enter new folder name:",
      type: "input",
      reset: true,
      button: "Create",
      submit: (name) => {
        name = name.replaceAll("/", "");
        let folder = (active.sideFolder || "/") + name + "/";

        if(active.files.find(f => f.folder === folder)) {
          return;
        }
        let files = active.files;
        files.push({
          folder: folder,
          files: []
        });
        setActive({...active, files});
      }
    });
  }

  return (
    <div>
      <div
        style={{"left": sideOpen ? "0%": "-75%"}}
        className={"ide-file-side" + (sideOpen ? " ide-file-side-active" : "") + (size === "normal" ? "" : " pl-3")}
      >
        <div className="ide-file-tab" onClick={() => setSideOpen(false)}>
          <i className="fas fa-bars"></i>
        </div>
        <div className="ide-file-tab" onClick={newFileDialog}>
          <i className="fas fa-file"></i>
        </div>
        <div className="ide-file-tab" onClick={newFolderDialog}>
          <i className="fas fa-folder"></i>
        </div>
        <div className="ide-file-tab" onClick={uploadFile}>
          <i className="fas fa-upload"></i>
        </div>

        {active.loaded && active.files.sort((a, b) => a.folder.localeCompare(b.folder)).filter(f => f.folder !== "/").map((location, i) => SideFolder(location.folder, i))}
        {active.loaded && SideFolder("/", 0, false)}  
      </div>

      <div className="ide-file-tab" onClick={() => setSideOpen(true)}>
        <i className="fas fa-bars"></i>
      </div>
          
      {active.loaded && active.open.map((open, i) => (
        <div key={i} className="d-inline">
          <span
            onClick={() => removeOpen(open)}
            className={"ide-file-tab ide-file-x" + ((active.file && open.filename === active.file.filename && open.folder === active.folder) ? " ide-file-selected" : "")}
          >x</span>
          <span 
            onClick={() => setActive({...active, file: openToFile(open), folder: open.folder})}
            className={"ide-file-tab ide-file-name" + ((active.file && open.filename === active.file.filename && open.folder === active.folder) ? " ide-file-selected" : "")}
          >
            {open.filename}
          </span>
        </div>
      ))}
    </div>
  )
}

export default IDEFiles;