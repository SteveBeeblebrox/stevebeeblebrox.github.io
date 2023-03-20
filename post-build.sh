# vfs.ts does not work minified
VFS_SOURCE="assets/ts/vfs.ts"
VFS_OUT="$BUILD_DIR/$("$WYVERN_DIR/pt$EXE_SUFFIX" $VFS_SOURCE ts~js '(?<=\.m|\.)tsx?$~~js')"
if [ "$VFS_SOURCE" -nt "$VFS_OUT" ]; then
    "$WYVERN_DIR/mtsc$EXE_SUFFIX" --target=es2019 --jsx=JSX.createElement $VFS_SOURCE --out=- > $VFS_OUT
fi;
# remove broken file
rm "$("$WYVERN_DIR/pt$EXE_SUFFIX" "$BUILD_DIR/$VFS_SOURCE" ts~js '(?<=\.m|\.)tsx?$~~js' '(?=\..?js.?$)~~.min')"