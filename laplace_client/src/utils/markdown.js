import MarkdownIt from 'markdown-it'
import hljs from "highlight.js";
import DOMPurify from 'dompurify';
import mditContainer from "markdown-it-container";

const getYoutubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp);

  return match && /^[0-9A-Za-z_-]{11}$/.test(match[2]) ? match[2] : null;
};

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe') {
    if (!/^(https:)?\/\/(www.)?(youtube.com)\/.*$/.test(node.src)) {
      node.remove();
    }
  }
});

const markdown = (content) => {
  const md = new MarkdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return "<code class='hljs'>" + hljs.highlight(lang, str).value + "</code>";
        } catch (__) {}
      }
      return '';
    }
  });

  // custom markdown plugins :)
  // thanks, https://github.com/pbteja1998/markdown-editor/blob/master/part-2/customMdParser.js
  md.use(mditContainer, 'youtube', {
    validate: function(params) {
      return params.trim().match(/^youtube\s+(.*)$/);
    },

    render: function (tokens, idx) {
      if (tokens[idx].type === 'container_youtube_open') {
        const matches = tokens[idx].info.trim().match(/^youtube\s*\[(.*)]$/)
        if (matches && matches[1]) {
          let id = getYoutubeVideoId(matches[1]);
          if(!id) {
            return `<span style="color: red">Error: Invalid YouTube URL</span><div class="text-center font-weight-light">`;
          }

          let wrapper = document.createElement("div");
          let iframe = document.createElement("iframe");

          wrapper.className = "embed-responsive embed-responsive-16by9 section-embed";
          iframe.className = "embed-responsive-item b-0";
          iframe.allow = "autoplay; picture-in-picture; fullscreen";
          iframe.src = `https://www.youtube.com/embed/${id}`;

          wrapper.appendChild(iframe);

          return wrapper.outerHTML + '<div class="text-center font-weight-light section-embed">';
        }
        return '';
      }
      else if (tokens[idx].type === 'container_youtube_close') {
        return '</div>'
      }
    }
  });

  md.use(mditContainer, 'video', {
    validate: function(params) {
      return params.trim().match(/^video\s+(.*)$/);
    },

    render: function (tokens, idx) {
      if (tokens[idx].type === 'container_video_open') {
        const matches = tokens[idx].info.trim().match(/^video\s*\[(.*)]$/)
        if (matches && matches[1]) {
          let url = matches[1];
          
          let wrapper = document.createElement("div");
          let video = document.createElement("video");
          let source = document.createElement("source");

          wrapper.className = "embed-responsive embed-responsive-16by9 section-embed";
          video.className = "embed-responsive-item b-0";
          video.controls = true;
          source.src = url;

          video.appendChild(source);
          wrapper.appendChild(video);

          return wrapper.outerHTML + '<div class="text-center font-weight-light section-embed">';
        }
        return '';
      }
      else if (tokens[idx].type === 'container_video_close') {
        return '</div>'
      }
    }
  });

  // :)
  return DOMPurify.sanitize(md.render(content || ""), {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow']
  });
};

export default markdown;