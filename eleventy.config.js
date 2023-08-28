const bundlerPlugin = require("@11ty/eleventy-plugin-bundle");
const shortcodes = require("./shortcodes.js");
const markdownIt = require("./markdown.js");
const pluginTOC = require('eleventy-plugin-nesting-toc');
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

// Config based on https://github.com/11ty/eleventy-base-blog/blob/main/eleventy.config.js
module.exports = function (eleventyConfig) {

    eleventyConfig.setLibrary('md', markdownIt);

    eleventyConfig.addPlugin(pluginTOC);

    eleventyConfig.addPlugin(bundlerPlugin);

    // Get the first `n` elements of a collection.
    eleventyConfig.addFilter("head", (array, n) => {
        if(!Array.isArray(array) || array.length === 0) {
            return [];
        }

        return n < 0 ? array.slice(n) : array.slice(0, n);
    });

    eleventyConfig.addPlugin(eleventyNavigationPlugin);

    // Universal Shortcodes (Adds to Liquid, Nunjucks, JavaScript, Handlebars)
    eleventyConfig.addPairedShortcode(
        "fullbleed",
        shortcodes.bleed
    );

    eleventyConfig.addPairedShortcode("container", shortcodes.container);

    /**
     * card-grid shortcode is a container for cards.
     * It automatically places cards and adds spacing between them.
     */
    eleventyConfig.addPairedShortcode("card-grid", shortcodes.cardGrid);


    /**
     * card shortcode is a card container.
     */
    eleventyConfig.addPairedShortcode(
        "card",
        shortcodes.card
    );

    eleventyConfig.addShortcode("figure", shortcodes.figure);
    eleventyConfig.addShortcode("button", shortcodes.button);
    eleventyConfig.addShortcode("quote", shortcodes.quote);

    eleventyConfig.addPairedShortcode(
        "aside",
        shortcodes.aside
    );

    eleventyConfig.addPassthroughCopy("img");
    eleventyConfig.addPassthroughCopy("static");

    return {
        // These are all optional:
        dir: {
            input: "content", // default: "."
            includes: "../_includes", // default: "_includes"
            data: "../_data", // default: "_data"
            output: "_site",
        },
    };
};
