import React from "react";
import MarkdownIt from 'markdown-it'
import hljs from "highlight.js";

function Markdown(props) {
	const mdParser = new MarkdownIt({
	  highlight: function (str, lang) {
	    if (lang && hljs.getLanguage(lang)) {
	      try {
	        return "<code class='hljs'>" + hljs.highlight(lang, str).value + "</code>";
	      } catch (__) {}
	    }
	    return '';
	  }
	});
	const html = mdParser.render(props.markdown);

	let settings = {...props};
	settings.markdown = null;

	return <div {...settings} dangerouslySetInnerHTML={{__html: html}}></div>;
}

export default Markdown;