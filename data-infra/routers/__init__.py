import glob
import importlib
from os.path import basename, dirname, isfile, join

from .autorouter import ROUTERS

modules = glob.glob(join(dirname(__file__), "*.py"))
[
    importlib.import_module(f".{basename(f)[:-3]}", "routers")
    for f in modules
    if isfile(f) and f.endswith(".py") and not f.endswith("autorouter.py") and not f.endswith("__init__.py")
]