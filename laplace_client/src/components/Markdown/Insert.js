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
    let url = process.env.REACT_APP_API_URL + "/file/" + file.code;
    let insert = `[${file.filename}](${url})\n`;

    let images = ["png", "gif", "jpeg", "jpg", "jfif", "svg", "webp"];
    let videos = ["mp4", "webm", "ogg"];

    let ext = file.filename.split(".").pop();

    if(images.includes(ext)) {
      this.editor.insertText(`![${url}](${url})\n`);
      return;
    }

    if(videos.includes(ext)) {
      this.editor.insertText(`:::video [${url}]\n:::\n`);
      return;
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
