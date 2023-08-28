const markdownItDefault = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

// you can use any plugins and configs you want
const markdownIt = markdownItDefault({
  html: true,
  breaks: false,
  linkify: true,
}).use(markdownItAnchor);

module.exports = markdownIt;
