import shutil
import os
import io

import logging
logging.basicConfig(level = logging.DEBUG)
log = logging.getLogger(__name__)

from yaml import load, Loader

from jinja2 import Environment, FileSystemLoader

def cleanup():
    log.debug('Cleaning public folder ...')
    shutil.rmtree('public', ignore_errors = True)
    shutil.copytree('site', 'public')
    os.makedirs('public/admin/templates')
    shutil.copy('site/index.html', 'public/admin/templates/index.html')

def generate_output(data):
    log.debug('Generating output ...')
    env = Environment(loader = FileSystemLoader('.'))
    template = env.get_template('site/index.html')
    template.stream(data).dump('public/index.html')

def load_data(filename):
    log.debug(f'Parsing meta-data from {filename}')
    with io.open(filename, 'rt', encoding = 'utf-8') as f:
        content = f.read()
        data = load(content, Loader = Loader)
        log.debug(f'Found {data} in {filename}')
        return data


cleanup()
data = load_data('site/_index.yml')
generate_output(data)
