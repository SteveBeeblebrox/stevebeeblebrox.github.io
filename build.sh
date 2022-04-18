if [ ! $(ls | grep mtsc.exe) ]
then
    echo "Error: mtsc.exe not found. Please dowload from https://github.com/SteveBeeblebrox/MTSC/releases"
    return 1
fi

# Fetch Latest Libraries
function gitfetch() {
    GIT_URL=https://raw.githubusercontent.com/SteveBeeblebrox
    DEFAULT_BRANCH=main
    
    curl $GIT_URL/$1/$DEFAULT_BRANCH/$2 > assets/${2##*.}/$2 2>/dev/null
}

gitfetch SHML shml.ts
gitfetch JSION jsion.ts

# Transpile and minify any ts files
for tsfile in $(ls assets/ts); do
    output=assets/js/$(basename $tsfile .${tsfile##*.}).min.js
    echo "//See /assets/ts/$tsfile for license info." > $output
    curl -X POST -s --data-urlencode "input=$(./mtsc.exe --target=es2019 --jsx=JSX.createElement assets/ts/$tsfile --out)" https://www.toptal.com/developers/javascript-minifier/raw >> $output
done;


for htmlxfile in $(find | grep .htmlx); do
    python3 ./generator.py $htmlxfile | ./mtsc.exe --html --target=es2019 --jsx=JSX.createElement --module=es2020 --out > $(echo $htmlxfile | sed 's/.htmlx/.html/')
done;

python3 ./sitemap.py