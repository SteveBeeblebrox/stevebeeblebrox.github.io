# vfs.ts does not work minified
VFS_SOURCE="assets/ts/vfs.ts"
VFS_OUT=$("$WYVERN_DIR/pt".exe $VFS_SOURCE ts~js '(?<=\.m|\.)tsx?$~~js')
if [ "$VFS_SOURCE" -nt "$VFS_OUT" ]; then
    "$WYVERN_DIR/mtsc.exe" --target=es2019 --jsx=JSX.createElement $VFS_SOURCE --out=- > $VFS_OUT
fi;
# remove broken file
rm "$("$WYVERN_DIR/pt".exe $VFS_SOURCE ts~js '(?<=\.m|\.)tsx?$~~js' '(?=\..?js.?$)~~.min')"