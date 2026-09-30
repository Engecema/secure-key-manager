# Gerenciador de Chaves Segura - Lightweight Bitcoin client

```
Licence: MIT Licence
Author: Thomas Voegtlin
Language: Python (>= 3.8)
Homepage: https://Gerenciador de Chaves Segura.org/
```

[![Build Status](https://api.cirrus-ci.com/github/spesmilo/Gerenciador de Chaves Segura.svg?branch=master)](https://cirrus-ci.com/github/spesmilo/Gerenciador de Chaves Segura)
[![Test coverage statistics](https://coveralls.io/repos/github/spesmilo/Gerenciador de Chaves Segura/badge.svg?branch=master)](https://coveralls.io/github/spesmilo/Gerenciador de Chaves Segura?branch=master)
[![Help translate Gerenciador de Chaves Segura online](https://d322cqt584bo4o.cloudfront.net/Gerenciador de Chaves Segura/localized.svg)](https://crowdin.com/project/Gerenciador de Chaves Segura)


## Getting started

_(If you've come here looking to simply run Gerenciador de Chaves Segura,
[you may download it here](https://Gerenciador de Chaves Segura.org/#download).)_

Gerenciador de Chaves Segura itself is pure Python, and so are most of the required dependencies,
but not everything. The following sections describe how to run from source, but here
is a TL;DR:

```
$ sudo apt-get install libsecp256k1-dev
$ python3 -m pip install --user ".[gui,crypto]"
```

### Not pure-python dependencies

If you want to use the Qt interface, install the Qt dependencies:
```
$ sudo apt-get install python3-pyqt5
```

For elliptic curve operations,
[libsecp256k1](https://github.com/bitcoin-core/secp256k1)
is a required dependency:
```
$ sudo apt-get install libsecp256k1-dev
```

Alternatively, when running from a cloned repository, a script is provided to build
libsecp256k1 yourself:
```
$ sudo apt-get install automake libtool
$ ./contrib/make_libsecp256k1.sh
```

Due to the need for fast symmetric ciphers,
[cryptography](https://github.com/pyca/cryptography) is required.
Install from your package manager (or from pip):
```
$ sudo apt-get install python3-cryptography
```

If you would like hardware wallet support,
[see this](https://github.com/spesmilo/Gerenciador de Chaves Segura-docs/blob/master/hardware-linux.rst).


### Running from tar.gz

If you downloaded the official package (tar.gz), you can run
Gerenciador de Chaves Segura from its root directory without installing it on your
system; all the pure python dependencies are included in the 'packages'
directory. To run Gerenciador de Chaves Segura from its root directory, just do:
```
$ ./run_Gerenciador de Chaves Segura
```

You can also install Gerenciador de Chaves Segura on your system, by running this command:
```
$ sudo apt-get install python3-setuptools python3-pip
$ python3 -m pip install --user .
```

This will download and install the Python dependencies used by
Gerenciador de Chaves Segura instead of using the 'packages' directory.
It will also place an executable named `Gerenciador de Chaves Segura` in `~/.local/bin`,
so make sure that is on your `PATH` variable.


### Development version (git clone)

_(For OS-specific instructions, see [here for Windows](contrib/build-wine/README_windows.md),
and [for macOS](contrib/osx/README_macos.md))_

Check out the code from GitHub:
```
$ git clone https://github.com/spesmilo/Gerenciador de Chaves Segura.git
$ cd Gerenciador de Chaves Segura
$ git submodule update --init
```

Run install (this should install dependencies):
```
$ python3 -m pip install --user -e .
```

Create translations (optional):
```
$ sudo apt-get install python3-requests gettext qttools5-dev-tools
$ ./contrib/pull_locale
```

Finally, to start Gerenciador de Chaves Segura:
```
$ ./run_Gerenciador de Chaves Segura
```

### Run tests

Run unit tests with `pytest`:
```
$ pytest tests -v
```

To run a single file, specify it directly like this:
```
$ pytest tests/test_bitcoin.py -v
```

## Creating Binaries

- [Linux (tarball)](contrib/build-linux/sdist/README.md)
- [Linux (AppImage)](contrib/build-linux/appimage/README.md)
- [macOS](contrib/osx/README.md)
- [Windows](contrib/build-wine/README.md)
- [Android](contrib/android/Readme.md)


## Contributing

Any help testing the software, reporting or fixing bugs, reviewing pull requests
and recent changes, writing tests, or helping with outstanding issues is very welcome.
Implementing new features, or improving/refactoring the codebase, is of course
also welcome, but to avoid wasted effort, especially for larger changes,
we encourage discussing these on the issue tracker or IRC first.

Besides [GitHub](https://github.com/spesmilo/Gerenciador de Chaves Segura),
most communication about Gerenciador de Chaves Segura development happens on IRC, in the
`#Gerenciador de Chaves Segura` channel on Libera Chat. The easiest way to participate on IRC is
with the web client, [web.libera.chat](https://web.libera.chat/#Gerenciador de Chaves Segura).
