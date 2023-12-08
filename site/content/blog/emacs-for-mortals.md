---
title: "Emacs for mortals"
date: 2022-02-16
---

## Why not ergoemacs/spacemacs/whatever

I believe that Emacs itself can be a very convenient editor and that
ergoemacs/spacemacs and other clones/wrappers should come into the game only
when the user *really* knows what he wants from them. I think that *most* needs of an
average user can be covered by vanilla Emacs with probably a few packages.

## Configuration file

To make changes in Emacs' settings, we will use the configuration file. If you use any Linux distro,
it's placed in your home directory: ~/.emacs. On Windows, configuration file
is hidden in `C://Users/Username/AppData/Local/.emacs`. 

Remember, you don't have to copy/paste all settings from here. If you feel comfortable with
Emacs' defaults - it's ok, skip that part.

## Awkward documentation terms

Emacs has some strange terms in its documentation, and if you are new to Emacs,
they can discourage you from learning. Here I'll list
some notes about things that were making me feel dumb when I was starting to 
use Emacs.

### Meta key

Emacs uses odd hotkey descriptions. If you read any info about its commands, you will
meet something like “To call this command, press `M-x command-name`”,
or “This command is bound to `M-w`”. What does `M` mean? Normal people think that this is
the M key, but we always need to keep in mind that this is Emacs, and there are no clear ways to do or explain something. 
The answer is: **This is the Alt key**. Who is interested – just search in the internet,
there is much info about it. So, if you see  `M` somewhere in the documentation, or blogs, or
tutorials, you should read it as `Alt`.

### Yank/kill

Remember, yank = copy, kill = cut.

## Cursor

By default, Emacs uses a “fat” cursor:

![](/img/emacs/emacs-fat-cursor.png)

It’s bizarre. What text is selected? It is hard to get the answer quickly, without a little brain work.
Almost all text editors have a thin cursor, which is placed between letters, and only if
you turn on Insert mode, it will look this way. Emacs cursor looks like it
is in insert mode, but it is not, and *it works like is not in insert mode*.
To make Emacs cursor thin, add these lines in the configuration file:


```
(setq-default cursor-type '(bar . 2))
(set-cursor-color "#FF0000")
```

Here, by changing .2 value, you regulate cursor width, and by changing the value `#ff0000`,
you are changing the cursor’s colour. The cursor with the above config settings
looks like this:

![](/img/emacs/emacs-thin-cursor.png)

## Search

By default, "search forward" command is bound to `Ctrl-s` hotkey. WTF? Bind it to `Ctrl-f` instead:

```
(global-set-key [(control f)] 'isearch-forward)
; isearch requires some customization to work with none default keys,
; since it uses its own keymap during a search.  These changes are *always*
; active, and not toggled with touchstream mode!  Luckily for us, the keys are
; we need are not used by isearch so there are no conflicts.
(define-key isearch-mode-map [(control f)] 'isearch-repeat-forward)
```

It is noteworthy that it is hard to make some customization in Emacs.
This is an example of such a case – this snippet I
found [here](https://emacs.stackexchange.com/questions/42527/trying-to-make-control-f-search-exactly-like-control-s-does).

## Save/open file

Let’s bind `Ctrl-s` keys to save the current file and `Ctrl-o` to open a file.

```
(global-set-key [(control o)] 'find-file)
(global-set-key [(control s)] 'save-buffer)
```

## Smooth mouse scroll

If you use mouse scroll in emacs, you will notice that it is
kind of raggy. This problem partially can be fixed by putting the following code into your .emacs file:

```   
;; scroll one line at a time (less "jumpy" than defaults)
(setq mouse-wheel-scroll-amount '(1 ((shift) . 1))) ;; one line at a time
(setq mouse-wheel-progressive-speed nil) ;; don't accelerate scrolling
(setq mouse-wheel-follow-mouse 't) ;; scroll window under mouse
(setq scroll-step 1) ;; keyboard scroll one line at a time
```

However, even that scroll becomes more smooth, I think there is something
missed in it, but I don’t know what.
The code snippet is from [here](https://www.emacswiki.org/emacs/SmoothScrolling).

## Visual theme

By default, Emacs looks like a shit right from the 80s. Fortunately, Emacs has
a lot of themes. You can go to [emacsthemes](https://emacsthemes.com/) and pick up the one that
is for you. Of course, this resource is just the collection of themes – most probably you can find
more cool things at GitHub repositories, blogs,  and so on. Most of the themes are available
from MELPA or ELPA repositories. Don’t clog your mind what are these, just add
this code to your .emacs file to be able to install plugins from them.

```
(setq package-archives '(("gnu" . "https://elpa.gnu.org/packages/")
                         ("melpa" . "https://melpa.org/packages/")))
```

Now, to open the list of packages, you need to run the command:

```
M-x list-packages
```

Then, you need to search for a theme or package (via standard emacs search, which
is probably bound to `Ctrl-f`, or, if not, to `Ctrl-s`),
press `I` to mark it for installation and then press `x` to install.
After that, you need to tell Emacs that you want to use some newly installed theme, so
you need to add this to your .emacs file:

```
(load-theme 'dracula)
```

Here, `dracula` is the theme name, just for example. Pass the name of your theme
instead.

## Use Mouse

You will see tons of suggestions to use only a keyboard, you will hear that
a mouse is for beginners, and most of your time you need to keep your
fingers in touch with your keyboard, and this is the only right way to
work
effectively with Emacs. Don’t listen. A mouse is a great device, and if
you feel
comfortable with it – use it.
One of the most natural ways to use the mouse is to move the cursor at some
position, or to select
some text or objects, and for an average user it is way faster to
click at some position, which the user already sees, than hack around with tens of commands just for placing the cursor at someplace.
Emacs allows you not only to work with the mouse like in many others
editors, but it has
one cool feature – call some handy context pop up menus with
useful functions.

The first popup menu is called by left click at any place of your document with the `Ctrl` key held.
This is the Buffer menu.
Another one is called by right-clicking with the held `Ctrl` key. This
context menu is
mode-specific -  this means that it will be different for different
modes, and depending on the current mode may be useful or maybe not.

## Replace selected text with the pasted one

You want to copy some text and then replace some part of your document
with it, and you think that copying and pasting to a selected region
will make the job done, and copied text will not be pasted right after the first
letter and
your text will not look like a mess? You fool. Add this to your .emacs
to be able to work
with text like all these sublime text and notepad++ muggles:

```
(delete-selection-mode 1)
```

Another option is to use cua-mode, this mode will be described later.

## Disable start-up message

By default, when you run emacs, you see its welcome screen, which
 contains links
 to tutorials, info about GNU/Everything and so on. Why do we need to
 see this every time?
 Vim has a similar one, but it is completely different because you
 can turn on edit mode right  in a welcome screen, and all noisy text will disappear, and you are
 ready to edit text.
 
 ![](/img/emacs/emacs-startup-message.png)

## Indentation

As usual, horrible defaults. In short –
when you want to insert `TAB`, you press the tab key. Not in Emacs, no. In
Emacs, if you
want to add indentation, you should use `M-i` hotkey. What does the tab key?
Eh, it
is hard to explain in simple terms.  From docs:

>Indent the current line or region, or insert a tab, as
>appropriate. This
>function either inserts a tab, or indents the current line, or performs
>symbol
>completion, depending on ‘tab-always-indent’.

Anyway, it does not what you generally expect when you press the tab. To fix
it, use the following command:

```
(global-set-key "\t" 'tab-to-tab-stop)
```

There is a problem, though. If you select the region and press the tab, only the first row will be indented. My elisp(emacs’ extension language) is not so
good to write such function, if you know how to make this, please email me.

## Words you delete replace text in your cut buffer

Maybe I have picked the wrong terms because Emacs terminology is very
complex, but let me describe what I mean: If you just have copied or
cut something, most probably you expect that this text will be kept
somewhere in your editor until you cut or copy
something different. But Emacs laughs at you, and every time you
delete a word via commands like `M-d` or `M-Backspace`, deleted word
replaces the content of your buffer.
`C-k` (delete rest of a line) works the same, probably there are at
least a few other commands that act like that. There is a special
mode in Emacs that allows you to work with `Ctrl-C`/`Ctrl-v`/`Ctrl-z` shortcuts as you expect. Add the following command to _.emacs_ file:

```
(cua-mode 1)
```

## Features that make Emacs great

Here are some **built-in** features that make work with Emacs
more convenient.

### Dired

Dired is the file manager that is shipped with Emacs. To call it, you
can use command M-x dired command or Ctrl-x d hotkey. When you run
dired, it first asks for a directory that you need to open.

![](/img/emacs/emacs-dired.png)

Must-have hotkeys:

  - `^` - up on one level
  - `D` – remove file or directory under the cursor
  - `+` – create new directory
  - `n/p` – next/previous line
  - `m/u` – mark/unmark file/directory under the cursor
  - `Ctrl-o` – open file under the cursor at another window, but keep the focus in dired

### Ido-mode (Interactively Do Things)

I really don't understand why it's not enabled by default.
What does this mode? In general terms, it's a completion
library that filters match anywhere in a list of available
items. I mainly use ido mode when I search for files or open buffers,
but there are a lot of ido commands: try to press `M-x ido-` and press
`tab` then, you'll see all possible commands.

Here are config lines for enabling ido mode:

```
(setq ido-enable-flex-matching t)
(setq ido-everywhere t)
(ido-mode 1)
```

And it's impossible not to mention one *great* package that
makes ido-mode even better, it's called `ido-vertical-mode`.
It reformats ido output in a vertical list, not horizontal, so
all possible completion variants look way friendlier for
eyes. It can be installed via melpa, as was described in the
"Visual theme" section. It looks like that:

![](/img/emacs/ido-vertical-mode.gif)
