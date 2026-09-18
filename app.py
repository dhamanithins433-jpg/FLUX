"""
SVCET College Portal - Application Entrypoint
Delegates execution to backend/app.py while ensuring correct working directory and Python path.
"""
import os
import sys
import runpy

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
backend_app_path = os.path.join(backend_dir, 'app.py')
os.chdir(backend_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if __name__ == '__main__':
    runpy.run_path(backend_app_path, run_name='__main__')
