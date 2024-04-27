#!/bin/bash
echo "Watching '$1'. Stop with Ctrl-Z."
while true; do 
    watch -n 1 -d -t -g ls -lR $1 >&/dev/null && bash wyvern compile apps/m41/index.htmlx && curl -d Updated ntfy.sh/19wZsBKfeGtNnpNQ
done;