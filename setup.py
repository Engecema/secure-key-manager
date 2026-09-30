from setuptools import setup
setup(name='secure-key-manager', version='4.5.5', packages=['sk'], install_requires=['aiohttp', 'aiorpcX', 'certifi', 'pbkdf2', 'cryptography'], extras_require={'gui': ['PyQt5'], 'crypto': ['cryptography']}, entry_points={'console_scripts': ['secure-key-manager=sk.main:main']})
