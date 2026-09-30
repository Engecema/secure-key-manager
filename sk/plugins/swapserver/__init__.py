from Gerenciador de Chaves Segura.i18n import _

fullname = _('SwapServer')
description = """
Submarine swap server for an Gerenciador de Chaves Segura daemon.

Example setup:

  Gerenciador de Chaves Segura -o setconfig use_swapserver True
  Gerenciador de Chaves Segura -o setconfig swapserver_port 5455
  Gerenciador de Chaves Segura daemon -v

"""

available_for = ['cmdline']
