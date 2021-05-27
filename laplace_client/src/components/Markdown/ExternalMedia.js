import * as React from "react";
import { PluginComponent } from "react-markdown-editor-lite";
import InputModal from "components/Modals/InputModal.js";

export default class ExternalMedia extends PluginComponent {
  static pluginName = "External Media";
  static align = "left";

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      inputOpen: false
    };
  }

  handleClick() {
    this.setState({
      inputOpen: true
    });
  }

  handleSubmit(url) {
    let images = ["png", "gif", "jpeg", "jpg", "jfif", "svg", "webp"];
    let videos = ["mp4", "webm", "ogg"];

    let ext = url.split(".").pop();

    if(images.includes(ext)) {
      this.editor.insertText(`![${url}](${url})\n`);
      return;
    }

    if(videos.includes(ext)) {
      this.editor.insertText(`:::video [${url}]\n:::\n`);
      return;
    }

    if(url.includes("youtube") || url.includes("youtu.be")) {
      this.editor.insertText(`:::youtube [${url}]\n:::\n`);
      return;
    }

    this.editor.insertText(`[](${url})\n`);
  }

  render() {
    return (
      <>
        <InputModal title="External Media" body="Enter external image/video or YouTube link:" submit={this.handleSubmit} open={(v) => this.setState({inputOpen: v})} isOpen={this.state.inputOpen} />
        <span
          className="button"
          title="External Media"
          onClick={this.handleClick}
        >
          <i className="fas fa-external-link-alt"></i>
        </span>
      </>
    );
  }
}
