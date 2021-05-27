import React from "react";
import markdown from "utils/markdown.js";

function Markdown(props) {
  let html = markdown(props.markdown);
  let options = props;
  options = {...options, markdown: null};
  return <div {...options} dangerouslySetInnerHTML={{__html: html}}></div>;
}

export default Markdown;