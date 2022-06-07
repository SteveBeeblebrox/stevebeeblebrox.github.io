import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import globals as user_globals
import fileinput
import textwrap
import re

def execexpr(script, globals=None, locals=None):
    import ast
    stmts = list(ast.iter_child_nodes(ast.parse(script)))
    if not stmts:
        return None
    if isinstance(stmts[-1], ast.Expr):
        if len(stmts) > 1:
            exec(compile(ast.Module(body=stmts[:-1],type_ignores=[]), filename="<ast>", mode="exec"), globals, locals)
        return eval(compile(ast.Expression(body=stmts[-1].value), filename="<ast>", mode="eval"), globals, locals)
    else:
        return exec(script, globals, locals)

with fileinput.input() as file:
    print(re.sub(                                    \
        r'%{(?P<content>[\s\S]*?)}',                 \
        lambda match: str(execexpr(                  \
            textwrap.dedent(match.group('content')), \
            globals().update({                       \
                key: getattr(user_globals, key)      \
                for key in dir(user_globals)         \
                 if not key.startswith('_')          \
            }),                                      \
            {}                                       \
        ) or '').strip(),                            \
        ''.join([line for line in file])             \
    ), end='')