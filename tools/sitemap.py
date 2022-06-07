import os
import json

assert os.getcwd().endswith('.github.io')

def dirmap(directory_path):
    directory_map ={}

    for entry_name in os.listdir(directory_path):
        if entry_name.startswith('.'):
            continue
        entry_path = os.path.join(directory_path, entry_name)
        if os.path.isfile(entry_path):
            directory_map[entry_name] = os.path.getmtime(entry_path)
        elif os.path.isdir(entry_path):
            directory_map[entry_name] = dirmap(entry_path)

    return directory_map


# Sitemap
# javascript:new Date($timestamp*1000)
try:
    sitemap = open("sitemap.json", "w")
    json.dump(dirmap('.'), sitemap)
except:
    print('Error creating sitemap!')
finally:
    sitemap.close()