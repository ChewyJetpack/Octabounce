import '../styles/index.scss';
import WebMidi from "webmidi";

WebMidi.enable(function (err) {
    console.log('WebMidi is running');

    const WebMidiSetup = () => {

        // all midi inputs
        const inputs = WebMidi.inputs;

        console.log(inputs);

        // create array of input names
        const inputNames= [];
        for (let input = 0; input < inputs.length; input++) {
            inputNames.push(inputs[input]._midiInput.name);
        }

        console.log(inputNames);
    };

    // record midi data
    const recordMidi = () => {
        const midiData = [];
        
    };

    // hard coded midi input - {todo} make this user-selectable
    const input = WebMidi.getInputByName('Komplete Audio 6 MIDI');

    // listen for 'play'
    input.on('start', "all", (e) => {
            console.log("Go!");
        }
    );

    // log out all received messages that are not clock messages (decimal 248)
    input.on('midimessage', 'all', (e) => {
        if (e.data.length > 1 || e.data[0] !== 248 ) {
            console.log(e.data);
        }
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