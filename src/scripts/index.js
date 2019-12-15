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

    // hard coded midi input - {todo} make this user-selectable
    const input = WebMidi.getInputByName('Komplete Audio 6 MIDI');

    // listen for 'play'
    input.on('start', "all",
        function (e) {
        console.log("Go!");
        }
    );

    // listen for 'stop
    input.on('stop', "all",
        function (e) {
        console.log("Stop!");
        }
    );
    
    WebMidiSetup();
});