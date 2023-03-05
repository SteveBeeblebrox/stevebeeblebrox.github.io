/*
 * Note Table
 * (c) MDN Contributors - https://creativecommons.org/licenses/by-sa/2.5/
 * Adapted for TypeScript
 * https://developer.mozilla.org/en-US/docs/Glossary/Base64
 * 
 * Timings from AudioContext example by Chirp Internet
 * https://chirpinternet.eu
 */
const chime = (function() {
    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    const ctx = new AudioContext();
    const EFFECTIVELY_ZERO = 1/1000;
    const table: Array<{[key: string]: number}> = Array.apply(null,{length:9} as unknown[]).map(o=>({})) as {[key: string]: number}[];

    table[0]["A"] = 27.500000000000000;
    table[0]["A#"] = 29.135235094880619;
    table[0]["B"] = 30.867706328507756;
    table[1]["C"] = 32.703195662574829;
    table[1]["C#"] = 34.647828872109012;
    table[1]["D"] = 36.708095989675945;
    table[1]["D#"] = 38.890872965260113;
    table[1]["E"] = 41.203444614108741;
    table[1]["F"] = 43.653528929125485;
    table[1]["F#"] = 46.249302838954299;
    table[1]["G"] = 48.999429497718661;
    table[1]["G#"] = 51.913087197493142;
    table[1]["A"] = 55.000000000000000;
    table[1]["A#"] = 58.270470189761239;
    table[1]["B"] = 61.735412657015513;

    table[2]["C"] = 65.406391325149658;
    table[2]["C#"] = 69.295657744218024;
    table[2]["D"] = 73.416191979351890;
    table[2]["D#"] = 77.781745930520227;
    table[2]["E"] = 82.406889228217482;
    table[2]["F"] = 87.307057858250971;
    table[2]["F#"] = 92.498605677908599;
    table[2]["G"] = 97.998858995437323;
    table[2]["G#"] = 103.826174394986284;
    table[2]["A"] = 110.000000000000000;
    table[2]["A#"] = 116.540940379522479;
    table[2]["B"] = 123.470825314031027;

    table[3]["C"] = 130.812782650299317;
    table[3]["C#"] = 138.591315488436048;
    table[3]["D"] = 146.832383958703780;
    table[3]["D#"] = 155.563491861040455;
    table[3]["E"] = 164.813778456434964;
    table[3]["F"] = 174.614115716501942;
    table[3]["F#"] = 184.997211355817199;
    table[3]["G"] = 195.997717990874647;
    table[3]["G#"] = 207.652348789972569;
    table[3]["A"] = 220.000000000000000;
    table[3]["A#"] = 233.081880759044958;
    table[3]["B"] = 246.941650628062055;
    
    table[4]["C"] = 261.625565300598634;
    table[4]["C#"] = 277.182630976872096;
    table[4]["D"] = 293.664767917407560;
    table[4]["D#"] = 311.126983722080910;
    table[4]["E"] = 329.627556912869929;
    table[4]["F"] = 349.228231433003884;
    table[4]["F#"] = 369.994422711634398;
    table[4]["G"] = 391.995435981749294;
    table[4]["G#"] = 415.304697579945138;
    table[4]["A"] = 440.000000000000000;
    table[4]["A#"] = 466.163761518089916;
    table[4]["B"] = 493.883301256124111;

    table[5]["C"] = 523.251130601197269;
    table[5]["C#"] = 554.365261953744192;
    table[5]["D"] = 587.329535834815120;
    table[5]["D#"] = 622.253967444161821;
    table[5]["E"] = 659.255113825739859;
    table[5]["F"] = 698.456462866007768;
    table[5]["F#"] = 739.988845423268797;
    table[5]["G"] = 783.990871963498588;
    table[5]["G#"] = 830.609395159890277;
    table[5]["A"] = 880.000000000000000;
    table[5]["A#"] = 932.327523036179832;
    table[5]["B"] = 987.766602512248223;

    table[6]["C"] = 1046.502261202394538;
    table[6]["C#"] = 1108.730523907488384;
    table[6]["D"] = 1174.659071669630241;
    table[6]["D#"] = 1244.507934888323642;
    table[6]["E"] = 1318.510227651479718;
    table[6]["F"] = 1396.912925732015537;
    table[6]["F#"] = 1479.977690846537595;
    table[6]["G"] = 1567.981743926997176;
    table[6]["G#"] = 1661.218790319780554;
    table[6]["A"] = 1760.000000000000000;
    table[6]["A#"] = 1864.655046072359665;
    table[6]["B"] = 1975.533205024496447;

    table[7]["C"] = 2093.004522404789077;
    table[7]["C#"] = 2217.461047814976769;
    table[7]["D"] = 2349.318143339260482;
    table[7]["D#"] = 2489.015869776647285;
    table[7]["E"] = 2637.020455302959437;
    table[7]["F"] = 2793.825851464031075;
    table[7]["F#"] = 2959.955381693075191;
    table[7]["G"] = 3135.963487853994352;
    table[7]["G#"] = 3322.437580639561108;
    table[7]["A"] = 3520.000000000000000;
    table[7]["A#"] = 3729.310092144719331;
    table[7]["B"] = 3951.066410048992894;
    table[8]["C"] = 4186.009044809578154;


    return async function chime(notes: string = '440 880 1200', {fadeOutTime = 0.5, defaultNoteTime = 0.2} = {}) {
        const parsedNotes = notes.split(/[,\s]+/g).map(function(entry) {
                const [note, time] = entry.split(':');
                let frequency = parseFloat(note);
                if(Number.isNaN(frequency)) {
                    const [letter, octave] = note.split(/(?=\d)/)
                    frequency = table[+(octave??4)][letter.toUpperCase()] ?? 0;
                }
                return [frequency, +(time??defaultNoteTime)]
            });

        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        const oscillator = ctx.createOscillator();
        oscillator.connect(gainNode);
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.frequency.setValueAtTime(0, ctx.currentTime);
        

        gainNode.gain.setValueAtTime(EFFECTIVELY_ZERO, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.02);
      
        for(const [note,time] of parsedNotes) {
            oscillator.frequency.setValueAtTime(+note, ctx.currentTime);
            await sleep(Math.max(1000*time-10,0));
        }

        gainNode.gain.setTargetAtTime(EFFECTIVELY_ZERO, ctx.currentTime + fadeOutTime - 0.05 - 0.04, 0.02);
        oscillator.stop(ctx.currentTime + fadeOutTime);
        await sleep(fadeOutTime*1000);
    }
})();