namespace Utils {
    export function download(resource: BlobPart, name?: string) {
        if(!(resource instanceof Blob)) resource = new Blob([resource]);
        const objectURL = URL.createObjectURL(resource);
        Object.assign(document.createElement('a'), {href: objectURL, download: name ?? '', onclick() {
            requestAnimationFrame(()=>URL.revokeObjectURL(objectURL));
        }}).click();
    }
}
