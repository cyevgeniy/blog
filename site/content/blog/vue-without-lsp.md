---
title: "Vue development with Emacs, Xmonad, typescript, and without VSCode and LSP"
date: 2023-08-29
eleventyExcludeFromCollections: true
---
In this article, I'll tell you how I work on vue projects
when I don't want to be distracted.

## Why not always LSP/VSCode?

LSP is a great tool, because it allows you to work with a
programming language in any editor that supports it, so you're not
tied to a single tool. But as for me, LSP often distracts me with its
error messages and hints. When I write code, I want nothing to be between
me and my editor. Yes, I can make a type mistake, forget to close a parenthes or quotes,
but I definitely don't want to paint my editor's window with all variations of
red and yellow error messages, hints and hovers.

## Make job done with simple tools

### Autocomplete

Try to use [company-mode](http://company-mode.github.io/).
Jokes aside, I was very surprised
when I first disabled LSP in Sublime Text and discovered that
simple autocomplete based on the current file's content is
enough for me.

### Typescript errors

For vue components, there's the [vue-tsc]() tool, which
can check typescript types in vue files, as well as in
files with `*.ts` extension. It can be launched
in a watch mode:

```
npx vue-tsc --noEmit --watch
```

I just always keep an instance of the terminal
with `vue-tsc` running in it.

### Eslint

I prefer to run Eslint right before commit, and I usually do
it with a simple command:

```
npx eslint .
```

## Xmonad

I usually display a terminal with `vue-tsc` at the bottom of the screen.
Browser is always fullscreen on another workspace (
I switch workspaces with `win`-`1`, `win`-`2` etc).

![Xmonad + emacs + vue-tsc](/img/vue-ts-no-vscode.png)
