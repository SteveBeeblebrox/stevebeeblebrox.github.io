///#pragma once
const importScript = async function importScript(src: string): Promise<unknown> {
    const result = await fetch(src);
    if(!result.ok) {
        throw new TypeError(`Failed to fetch dynamically evaluated script: ${src}`);
    }
    return eval(await result.text());
}