import fileinput
import re

with open('./globals.py', 'r') as file:
    data = eval(file.read())

def getValue(match):
    try:
        return str(data[match.groups(0)[0]]).strip()
    except:
        return ''

for line in fileinput.input():
    print(re.sub(r'%{\s*(\w+)\s*}',getValue,line),end='')