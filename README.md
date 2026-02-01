Faderfox UC4 Configurator
================

Interactive WebMIDI Configurator for [FaderFox UC4 MIDI Controllers](https://faderfox.de/uc4.html)

[![UC4 Configurator Interface](/docs/screenshot.png?raw=true)](https://uc4.ivo.tech/)

Try it out: https://uc4.ivo.tech/

_Note: Only supports a single configuration (I.E. 8 groups). If it doesn't read, ensure you're on configuration `SE01`_

_Note: This is an unofficial application and not endorsed by or affiliated with Faderfox._

Requirements
------------

 * Node 24+

Installation
------------

1. Clone: `git clone https://github.com/foxxyz/faderfox-uc4-configurator`
2. Install dependencies: `npm install`
3. Test it works: `npm run dev`

Deployment
----------

1. Compile: `npm run build`
2. Upload contents of `dist` to a directory accessible by your web server.

Credits
-------

 * Credit to prior work by [Peter Witzel](https://github.com/privatepublic-de) for their [Faderfox Controller Editor](https://github.com/privatepublic-de/faderfox-editor/tree/master)
 * Credit to prior work by [thegdyne](https://github.com/thegdyne) on their [UC4 SysEx Editor](https://github.com/thegdyne/uc4-sysex-editor)
 * Big thanks to [Mathias from Faderfox](https://faderfox.de/about.html) for sharing some of the communication protocol

License
-------

MIT

