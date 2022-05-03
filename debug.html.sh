function compilehtmlx() {
    python3 ./generator.py $1 | ./mtsc.exe --verbose --html --target=es2019 --jsx=JSX.createElement --module=es2020 --out > $(echo $1 | sed 's/.htmlx/.html/')
}

python3 -m http.server &

if (( $# != 0 )); then
    while true; do 
        inotifywait -e modify $1 &>/dev/null && compilehtmlx $1
    done
fi