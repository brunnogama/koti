#!/usr/bin/python3
"""Execução em desenvolvimento: python3 desktop/run.py"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from koti.app import main  # noqa: E402

sys.exit(main(sys.argv))
