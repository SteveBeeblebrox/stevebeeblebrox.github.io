/*
 * MIT License
 * 
 * Copyright (c) 2023 Trin Wasinger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
class Keybinds {
   private static readonly CommandKeys = (function() {
      enum CommandKeys {
         Control = 'control',
         Shift = 'shift',
         Alt = 'alt',
         Meta = 'meta',
         Windows = 'windows'
      }
      return CommandKeys; 
   })();
   private static readonly DEFAULT_INSTANCE = new Keybinds();
   private static readonly COMMAND_KEYS_ARRAY = Object.values(Keybinds.CommandKeys).filter(x=>typeof x === 'string') as string[];
   private static readonly COMMAND_KEYS = Keybinds.COMMAND_KEYS_ARRAY.filter(x=>x!=Keybinds.CommandKeys.Windows);
   private readonly levels = Array.apply(null, {length:5} as unknown[]).map(_=>new Map()) as Map<{char: string, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean},Function>[];
   private readonly keys = new Map<string, boolean>();
   constructor(private readonly target: EventTarget = window) {
      target.addEventListener('keydown',this.onKeydownEvent);
      target.addEventListener('keyup',this.onKeyupEvent);
      target.addEventListener('blur',this.onBlurEvent);
   }
   static on(pattern: string, f: Function) {
      return Keybinds.DEFAULT_INSTANCE.on(pattern, f)
   }
   on(pattern: string, f: Function) {
      const reqs = pattern.split(/\s+[+,]?\s?/).map(o=>o.toLowerCase().replaceAll(/^ctrl$/g,Keybinds.CommandKeys.Control));
      this.levels[Math.min(reqs.length-1,4)]!.set({
         ctrlKey: reqs.includes(Keybinds.CommandKeys.Control),
         shiftKey: reqs.includes(Keybinds.CommandKeys.Shift),
         altKey: reqs.includes(Keybinds.CommandKeys.Alt),
         metaKey: reqs.includes(Keybinds.CommandKeys.Meta) || reqs.includes(Keybinds.CommandKeys.Windows),
         char: reqs.find(c=>!Keybinds.COMMAND_KEYS_ARRAY.includes(c)) ?? (()=>{throw new Error(`Keybind '${pattern}' must contain a non command key`)})()
      },f);
   }
   static isKeyDown(key: string): boolean {
      return Keybinds.DEFAULT_INSTANCE.isKeyDown(key);
   }
   isKeyDown(key: string): boolean {
      return !!this.keys.get(key.toLowerCase())
   }
   detach() {
      this.target.removeEventListener('keydown',this.onKeydownEvent);
      this.target.removeEventListener('keyup',this.onKeyupEvent);
      this.target.removeEventListener('blur',this.onBlurEvent);
   }
   private readonly onKeydownEvent = (function(this: Keybinds, event: KeyboardEvent) {
      this.keys.set(event.key.replace(/^ $/,'Space').toLowerCase(), true);
      if((Keybinds.COMMAND_KEYS as string[]).includes(event.key.toLowerCase())) return;
      const length = +event.ctrlKey + +event.shiftKey + +event.altKey + +event.metaKey;
      const f  = [...this.levels[length].entries()].find(function([reqs]) {
         return (!reqs.ctrlKey || event.ctrlKey)
         && (!reqs.shiftKey || event.shiftKey)
         && (!reqs.altKey || event.altKey)
         && (!reqs.metaKey || event.metaKey)
         && reqs.char === event.key.replace(/^ $/,'Space').toLowerCase();
      })?.[1];
      if(f) {
         event.preventDefault();
         f();
      }
   }).bind(this) as EventListener;

   private readonly onKeyupEvent = (function(this: Keybinds, event: KeyboardEvent) {
      this.keys.set(event.key.replace(/^ $/,'Space').toLowerCase(), false);
   }).bind(this) as EventListener;

   private readonly onBlurEvent = (function(this: Keybinds, event: Event) {
      this.keys.clear();
   }).bind(this) as EventListener;
}
