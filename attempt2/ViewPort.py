import ipyreact
from pathlib import Path

class ViewPort(ipyreact.Widget):
    
    _esm = Path(__file__).parent / 'ViewPort.tsx'