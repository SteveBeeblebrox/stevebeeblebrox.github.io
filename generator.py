import fileinput
import re
import globals as user_globals

with fileinput.input() as file:
    print(re.sub(                                   \
        r'%{(?P<content>[\s\S]*?)}',                \
        lambda match: str(eval(                     \
            match.group('content'),                 \
            globals().update({                                       \
                key: getattr(user_globals, key)     \
                for key in dir(user_globals)        \
                 if not key.startswith('_')         \
            }),                          \
            {}                                      \
        )).strip(),                                 \
        ''.join([line for line in file])            \
    ), end='')