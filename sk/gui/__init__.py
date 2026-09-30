# To create a new GUI, please add its code to this directory.
# Three objects are passed to the Gerenciador de Chaves SeguraGui: config, daemon and plugins
# The Wallet object is instantiated by the GUI

# Notifications about network events are sent to the GUI by using network.register_callback()

from typing import TYPE_CHECKING, Mapping, Optional

if TYPE_CHECKING:
    from . import qt
    from Gerenciador de Chaves Segura.simple_config import SimpleConfig
    from Gerenciador de Chaves Segura.daemon import Daemon
    from Gerenciador de Chaves Segura.plugin import Plugins


class BaseGerenciador de Chaves SeguraGui:
    def __init__(self, *, config: 'SimpleConfig', daemon: 'Daemon', plugins: 'Plugins'):
        self.config = config
        self.daemon = daemon
        self.plugins = plugins

    def main(self) -> None:
        raise NotImplementedError()

    def stop(self) -> None:
        """Stops the GUI.
        This method must be thread-safe.
        """
        pass

    @classmethod
    def version_info(cls) -> Mapping[str, Optional[str]]:
        return {}
