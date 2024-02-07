SCRIPTS = '''
        <script src="/assets/js/base64.min.js"></script>
        <script src="/assets/js/compression.min.js"></script>
        <script src="/assets/js/domlib.min.js?bind=globalThis"></script>
        <script src="/assets/js/encryption.min.js"></script>
        <script src="/assets/js/jsion.min.js"></script>
        <script src="/assets/js/jsx.min.js"></script>
        <script src="/assets/js/shml.min.js"></script>
        <script src="/assets/js/elementfactory.min.js"></script>
        <script src="/assets/js/elements.min.js"></script>
        <script src="/assets/js/configstring.min.js"></script>
        <script src="/assets/js/toast.min.js"></script>
'''
VFS_SCRIPTS = '''
        <script src="/assets/js/vfs.js"></script>
'''


TS='type="text/typescript"'
TSMODULE='type="tsmodule"'
LESS='type="text/less"'

def HEAD(*, title: str = 'Document', appTitle: str = None, kcore: bool = True):
    appTitleOverride = f'''
        <meta name="apple-mobile-web-app-title" content="{appTitle}">
        <meta name="application-name" content="{appTitle}">''' if appTitle != None else ''
    kitsuneScriptTag = '''
        <script src="/assets/js/kitsunecore.min.js"></script>''' if kcore else ''

    return f'''
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/icons/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/icons/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/icons/favicon-16x16.png">
        <link rel="manifest" href="/assets/images/icons/site.webmanifest">
        <link rel="mask-icon" href="/assets/images/icons/safari-pinned-tab.svg" color="#ff7fad">
        <link rel="shortcut icon" href="/assets/images/icons/favicon.ico">

        <meta name="msapplication-TileColor" content="#ff7fad">
        <meta name="msapplication-config" content="/assets/images/icons/browserconfig.xml">
        <meta name="theme-color" content="#ffffff">

        <link rel="stylesheet" href="/assets/css/chromium.css">

        <title>{title}</title>

        <style>html {{font-family: arial;}}</style>
''' + appTitleOverride + kitsuneScriptTag

from datetime import datetime
DATE = datetime.now()