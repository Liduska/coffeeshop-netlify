import shutil
from jinja2 import Environment, FileSystemLoader
env = Environment(loader=FileSystemLoader('.'))

shutil.rmtree('public', ignore_errors = True)
shutil.copytree('site', 'public')

template = env.get_template('site/index.html')

data = {

}

template.stream(data).dump('public/index.html')
