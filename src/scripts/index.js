import '../styles/index.scss';
import WebMidi from "webmidi";

WebMidi.enable(function (err) {
    console.log('WebMidi is running');

    const WebMidiSetup = () => {

        // all midi inputs
        const inputs = WebMidi.inputs;

        // create array of input names
        const inputNames= [];
        for (let input = 0; input < inputs.length; input++) {
            inputNames.push(inputs[input]._midiInput.name);
        }

        // useful tools for reference or debugging
        console.log('MIDI_CHANNEL_MESSAGES:');
        console.log(WebMidi.MIDI_CHANNEL_MESSAGES);
        console.log('MIDI_CHANNEL_MODE_MESSAGES:');
        console.log(WebMidi.MIDI_CHANNEL_MODE_MESSAGES);
        console.log('MIDI_CONTROL_CHANGE_MESSAGES:');
        console.log(WebMidi.MIDI_CONTROL_CHANGE_MESSAGES);
        console.log('MIDI_NRPN_MESSAGES:');
        console.log(WebMidi.MIDI_NRPN_MESSAGES);
        console.log('MIDI_REGISTERED_PARAMETER:');
        console.log(WebMidi.MIDI_REGISTERED_PARAMETER);
        console.log('MIDI_SYSTEM_MESSAGES:');
        console.log(WebMidi.MIDI_SYSTEM_MESSAGES);
    };

    // hard coded midi device - {todo} make this user-selectable
    const input = WebMidi.getInputByName('Komplete Audio 6 MIDI');
    const output = WebMidi.getOutputByName('Komplete Audio 6 MIDI');

    // listen for 'play'
    input.on('start', "all", (e) => {
            console.log("Go!");
        }
    );

    // log out all received messages that are not clock messages (decimal 248)
    // input.on('midimessage', 'all', (e) => {
    //     if (e.data.length > 1 || e.data[0] !== 248 ) {
    //         console.log(e.data);
    //     }
    // });


    // detect tempo
    let tickCounter = 0;
    let tickTimes = [];
    let tickDiffs = [];
    const calcBpm = (tick) => {
        return 60000 / (tick * 24);
    };
    const roundBpm = (tick) => {
        return Math.round( calcBpm(tick) * 10 ) / 10;
    };

    input.on('midimessage', 'all', (e) => {

        // get current time
        let tickStart = WebMidi.time;

        // check only for tick messages (248)
        if (e.data[0] === 248) {
            
            // get tick start time, push to array
            tickTimes.push(tickStart);

            if (tickCounter > 1) {
                let lastTick = tickTimes[tickCounter - 1];
                let currentDiff = tickStart - lastTick;  
                tickDiffs.push(currentDiff);
                let diffTotal = 0;
                
                if (tickDiffs.length > 96) { tickDiffs = []; };
                for (let diff = 0; diff < tickDiffs.length; diff++) {
                    diffTotal += tickDiffs[diff];
                    if (diff == tickDiffs.length - 1) {
                        let tickAvg = diffTotal / tickDiffs.length;
                        if (tickCounter % 24 === 0) { document.getElementById("tempo").innerHTML = roundBpm(tickAvg); };
                    }
                }
            };

            tickCounter++; 
        }; 
    });


    // need to write midi data to some kind of storage, ready for play back.
    // https://github.com/grimmdude/MidiWriterJS

    // listen for 'stop
    input.on('stop', "all", (e) => {
            console.log("Stop!");
        }
    );
    
    WebMidiSetup();
});