import * as React from "react";
import { PluginComponent } from "react-markdown-editor-lite";
import FileListModal from "components/Modals/FileListModal.js";

export default class Insert extends PluginComponent {
  static pluginName = "Insert";
  static align = "left";

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      listOpen: false
    };
  }

  handleClick() {
    this.setState({
      listOpen: true
    });
  }

  handleSubmit(file) {
    let url = process.env.REACT_APP_API_URL + "/api/file/" + file.code;
    let insert = `[${file.filename}](${url})\n`;

    let images = ["png", "gif", "jpeg", "jpg", "jfif", "svg", "webp"];

    if(images.includes(file.filename.split(".").pop())) {
      insert = "!" + insert;
    }
    this.editor.insertText(insert);
  }

  render() {
    return (
      <>
        <FileListModal title="Select File" submit={this.handleSubmit} open={(v) => this.setState({listOpen: v})} isOpen={this.state.listOpen} />
        <span
          className="button"
          title="Insert File"
          onClick={this.handleClick}
        >
          <i className="fa fa-file" />
        </span>
      </>
    );
  }
}
