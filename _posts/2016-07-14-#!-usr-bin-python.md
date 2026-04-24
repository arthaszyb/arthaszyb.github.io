---
title: "#!/usr/bin/python"
date: 2016-07-14 16:20:02 +0000
categories: ["python"]
tags: ["Pages"]
description: "Thursday, July 14, 2016 4:20 PM #encoding: utf-8 ############################################### # generate package helper script for service # Author: curuwang"
source: "evernote-local-db"
---

#!/usr/bin/python
Thursday, July 14, 2016
4:20 PM
#!/usr/bin/python
#encoding: utf-8
###############################################
# generate package helper script for service
# Author: curuwang
# Date: 2013-11-07

# Changelog:
# - 2015-07-23 marryhe 2.1.5
# * 拉取监控上报频率字段
###############################################
import io
import json
import os
import urllib2
import sys
import tarfile
from optparse import OptionParser
import StringIO
import re

import mimetypes
import random
import string

reload(sys)
sys.setdefaultencoding('utf-8')

packaging_url = '
http://om.tr.com/cgi-bin/packaging_new
'
upload_url = '
http://om.tr.com/cgi-bin/pkg_upload_new
'
script_update_url='http://om.tr.com/cgi-bin/script_update?latest=1'
query_timeout = 120
pkg_conf_name = 'package.conf'
cron_conf_name = 'cron.conf'

_BOUNDARY_CHARS = string.digits + string.ascii_letters

def dump(obj):
print json.dumps(obj, indent=4,ensure_ascii=False, encoding="utf-8")

def encode_multipart(fields, files, boundary=None):
def escape_quote(s):
return s.replace('"', '\\"')

if boundary is None:
boundary = ''.join(random.choice(_BOUNDARY_CHARS) for i in range(30))
lines = []

for name, value in fields.items():
lines.extend((
'--{0}'.format(boundary),
'Content-Disposition: form-data; name="{0}"'.format(escape_quote(name)),
'',
str(value),
))

for name, value in files.items():
filename = value['filename']
if 'mimetype' in value:
mimetype = value['mimetype']
else:
mimetype = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
lines.extend((
'--{0}'.format(boundary),
'Content-Disposition: form-data; name="{0}"; filename="{1}"'.format(
escape_quote(name), escape_quote(filename)),
'Content-Type: {0}'.format(mimetype),
'',
value['content'],
))

lines.extend((
'--{0}--'.format(boundary),
'',
))
body = '\r\n'.join(lines)

headers = {
'Content-Type': 'multipart/form-data; boundary={0}'.format(boundary),
'Content-Length': str(len(body)),
}

return (body, headers)

def query_packaging(action, data):
req_obj = {
"Action" : action,
"Data" : data
}
req_json = json.dumps(req_obj).encode("utf-8")
try:
req = urllib2.urlopen(packaging_url, req_json, query_timeout)
except urllib2.URLError as e:
print "error querying server: %s" % e
return None
return json.loads(req.read())['Data']

def download_and_extract_svrscript(target_dir="."):
try:
req = urllib2.urlopen(script_update_url, None, query_timeout)
tmp_file = io.BytesIO(req.read())
except urllib2.URLError as e:
print "error download svr_script: %s" % e
return False
#extract
try:
tar = tarfile.open(mode="r:gz", fileobj=tmp_file)
except tarfile.TarError as e:
print "unable to open script package: %s" % e
return False
try:
tar.extractall(target_dir)
tar.close()
except IOError as e:
print "failed to extract script package:%s" % e

return True

def get_pkg_info(pkg_name):
return query_packaging("queryPkgInfo", { "pkg_name" : pkg_name})

def get_pkg_services(pkg_name):
return query_packaging("queryPkgServices", { "pkg_name" : pkg_name})

def get_pkg_crontab(pkg_name):
return query_packaging("queryPkgCron", { "pkg_name" : pkg_name})

def write_file(file_path, content, overrite):
if os.path.exists(file_path) and not overrite:
print "file '%s' exist, aborted. Use -f|--overrite option to overrite" % file_path
sys.exit(1)
#create upper directory if not exist
file_dir = os.path.dirname(file_path)
try:
if not os.path.exists(file_dir):
os.makedirs(file_dir)
open(file_path, "w").writelines(content)
except os.error as e:
print e
return
return True

def gen_pkg_conf(pkg_name,pkg_type):
pkg_info = get_pkg_info(pkg_name)
if pkg_type == "test":
pkg_info['version'] = 'test'
pkg_conf = []
pkg_conf.append("#package global settings")
pkg_conf.append('PKGID="%d"' % int(pkg_info['pkg_id']))
pkg_conf.append('PACKAGE_NAME="%s"' % pkg_info['pkg_name'])
pkg_conf.append('VERSION="%s"' % pkg_info['version'])
pkg_conf.append('DEVELOPER="%s"' % pkg_info['developer'])
#trim desc to most 50 char
desc = pkg_info['descr'][0:50].replace('"',"'")
pkg_conf.append('SHORT_DESC="%s"' % desc)
pkg_conf.append('ALARM_NOTIFY="%s"' % pkg_info['alert_to'])
pkg_conf.append('ALARM_MAIL="%s"' % pkg_info['mail_to'])
pkg_conf.append('ALARM_WEIXIN="%s"' % pkg_info['weixin_to'])
pkg_conf.append('BE_QUIET="%d"' % int(pkg_info['b_alert']))
pkg_conf.append('REPORT_FREQUENT="%d"' % int(pkg_info['report_frequent']))

services = get_pkg_services(pkg_name)
service_names = [ s['svr_name'] for s in services ]
pkg_conf.append('SERVICE_LIST="%s"' % " ".join(service_names))
pkg_conf.append("")

pkg_conf.append('#services settings')
field_hide = ('svr_name', 'pkg_id', 'start_order', 'enabled')
for service in services:
service_name = service['svr_name']
for key in sorted(service.keys()):
if key in field_hide: continue
value = service[key]
if key == 'descr':
value = value[0:50].replace('"',"'")
if value is None:
value = ""
pkg_conf.append('%s__%s="%s"' % (service_name, key, value))
pkg_conf.append("")
return "\n".join(pkg_conf)

def gen_cron_conf(pkg_name):
pkg_crontabs = get_pkg_crontab(pkg_name)
cron_conf = []
cron_conf.append('''#包crontab配置文件,可使用变量替换，可用变量列表:
# __BASEDIR__ : 服务所在的上层目录，底下是bin,conf等目录
''')
cron_conf.append('PACKAGE_NAME=%s' % pkg_name)
cron_conf.append('CRON_BEGIN\n')

for entry in pkg_crontabs:
cron_conf.append("#" + entry['comment'])
cron_conf.append(entry['run_time'] + " " + entry['cmd'])
cron_conf.append("")
cron_conf.append('CRON_END')
return "\n".join(cron_conf)

def pkg_exclude(file_name):
#print "file_name:" + file_name
if re.search(r'/.svn$|.svn/|/log$|/log/|/data$|/data/', file_name, re.I):
return True
else:
return False

def tar_package(pkg_dir):
pkg_parent = os.path.dirname(pkg_dir)
pkg_base = os.path.basename(pkg_dir)
os.chdir(pkg_parent)
s = StringIO.StringIO()
tar = tarfile.open(mode="w:gz", fileobj=s)
tar.add(pkg_base, exclude=pkg_exclude, recursive=True)
print tar.list()
tar.close()
return s.getvalue()

def upload(pkg_name,pkg_version,pkg_type,upload_data):
fields = {'pkg_name': pkg_name,'pkg_version':pkg_version,'pkg_type':pkg_type}
files = {'pkg_file': {'filename': pkg_name, 'content': upload_data}}
try:
data,headers = encode_multipart(fields, files)
request = urllib2.Request(upload_url, data=data, headers=headers)
f = urllib2.urlopen(request, None, query_timeout)
print f.read()
return True
except Exception as e:
print e
return False

if __name__ == '__main__':
usage = "Usage: %s pkg_name pkg_type[test|online]" % sys.argv[0]
opt_parser = OptionParser(usage=usage)
opt_parser.add_option("-d", "--basedir", dest = 'basedir',
help = "package base directory", metavar = "DIR", default=".")
opt_parser.add_option("-f", "--overrite", dest = 'overrite', action="store_true",
default=True, help = "overrite existing config file")
(options, args) = opt_parser.parse_args()

if len(args)
<
2:
sys.stderr.write(usage + "\n")
sys.exit(1)
real_path = os.path.realpath(options.basedir)
if not os.path.isdir("%s/bin"%(real_path)) or not os.path.isdir("%s/conf"%(real_path)):
print "Incorrect package directory '%s': no bin/ or conf/ sub directory!" % real_path
sys.exit(1)
pkg_name, pkg_type = args
print "querying package info..."
pkg_info = get_pkg_info(pkg_name)
if not pkg_info:
sys.stderr.write("ERROR: package %s is not registered\n" % (pkg_name))
sys.exit(1)
if pkg_type != "online" and pkg_type != "test":
sys.stderr.write("ERROR: pkg_type: %s is not online or test\n" % (pkg_type))
sys.exit(1)

print "download and extract svrscript to %s" % options.basedir
download_and_extract_svrscript(options.basedir)

pkg_config_file = os.path.join(options.basedir, 'script', pkg_conf_name)
cron_config_file = os.path.join(options.basedir, 'script', cron_conf_name)
print "querying service info..."
pkg_conf = gen_pkg_conf(pkg_name,pkg_type)
print "querying package crontab..."
cron_conf = gen_cron_conf(pkg_name)
print "writing '%s' ..." % pkg_config_file
write_file(pkg_config_file, pkg_conf, options.overrite)
print "writing '%s' ..." % cron_config_file
write_file(cron_config_file, cron_conf, options.overrite)
if upload(pkg_name,pkg_info['version'],pkg_type,tar_package(real_path)):
print "version:%s"%(pkg_info['version']) if pkg_type == "online" else "version:test"
else:
print "xxoo..xxoo..,upload failed!"

已使用 Microsoft OneNote 2016 创建。
