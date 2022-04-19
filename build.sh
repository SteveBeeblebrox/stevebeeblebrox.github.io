UPDATE=false
MINIFY=false

# https://www.banjocode.com/post/bash/flags-bash/
for arg in "$@"; do
    case $arg in
    -u | --update)
        UPDATE=true
        shift
        ;;
    -m | --minify)
        MINIFY=true
        shift
        ;;
    *)
        ;;
    esac
done


if [ ! $(ls | grep mtsc.exe) ]; then
    echo "Error: mtsc.exe not found. Please dowload from https://github.com/SteveBeeblebrox/MTSC/releases"
    return 1
fi

# Fetch Latest Libraries
function gitfetch() {
    GIT_URL=https://raw.githubusercontent.com/SteveBeeblebrox
    DEFAULT_BRANCH=main
    
    curl $GIT_URL/$1/$DEFAULT_BRANCH/$2 > assets/${2##*.}/$2 2>/dev/null
}

if [[ $UPDATE = true ]]; then
    gitfetch SHML shml.ts
    gitfetch JSION jsion.ts
fi

# Transpile and minify any ts files
for tsfile in $(ls assets/ts); do
    output=assets/js/$(basename $tsfile .${tsfile##*.}).min.js
    echo "//See /assets/ts/$tsfile for license info." > $output
    if [[ $MINIFY = true ]]; then
        curl -X POST -s --data-urlencode "input=$(./mtsc.exe --target=es2019 --jsx=JSX.createElement assets/ts/$tsfile --out)" https://www.toptal.com/developers/javascript-minifier/raw >> $output
    else
        ./mtsc.exe --target=es2019 --jsx=JSX.createElement assets/ts/$tsfile --out=$output
    fi
done;


for htmlxfile in $(find | grep .htmlx); do
    python3 ./generator.py $htmlxfile | ./mtsc.exe --verbose --html --target=es2019 --jsx=JSX.createElement --module=es2020 --out > $(echo $htmlxfile | sed 's/.htmlx/.html/')
done;

python3 ./sitemap.py