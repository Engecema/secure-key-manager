from .labels import LabelsPlugin
from Gerenciador de Chaves Segura.plugin import hook

class Plugin(LabelsPlugin):

    @hook
    def load_wallet(self, wallet, window):
        self.start_wallet(wallet)

    def on_pulled(self, wallet):
        self.logger.info('labels pulled from server')
