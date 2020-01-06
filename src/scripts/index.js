import '../styles/index.scss';
import WebMidi from "webmidi";

WebMidi.enable(function (err) {

    const WebMidiSetup = () => {

        // all midi inputs
        const inputs = WebMidi.inputs;
        const outputs = WebMidi.outputs;
        console.log(outputs);

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

    WebMidiSetup();

    // hard coded midi device - {todo} make this user-selectable
    const input = WebMidi.getInputById('981459792');
    const output = WebMidi.getOutputById('-1764261658');

    // console.log(output);

    // // test sending a start message
    // output.sendStart();

    // listen for 'play'
    input.on('start', "all", (e) => {
            console.log("Go!");
        }
    );


    // tempo detection
    let tickCounter = 0;
    let tickTimes = [];
    let tickDiffs = [];

    // recording midi messages
    const recording = [];

    // calculate the bpm using the duration of each tick
    const calcBpm = (tick) => {
        return 60000 / (tick * 24);
    };

    // round the bpm to one decimal place
    const roundBpm = (tick) => {
        return Math.round( calcBpm(tick) * 10 ) / 10;
    };

    input.on('midimessage', 'all', (e) => {


        // check only for tick messages (248)
        if (e.data[0] === 248) {

            // get current time
            let tickStart = WebMidi.time;
            
            // get tick start time, push to array
            tickTimes.push(tickStart);

            if (tickCounter > 1) {

                // get the time of the previous tick and calculate the time elapsed before the current tick
                let lastTick = tickTimes[tickCounter - 1];
                let currentDiff = tickStart - lastTick;  

                // store the time since the last tick in an array
                tickDiffs.push(currentDiff);

                // if the array gets too long, empty it (curretly refreshes once per bar)
                if (tickDiffs.length > 96) { tickDiffs = []; };

                // calculate the average time between ticks since the last array refresh                
                let diffTotal = 0;
                for (let diff = 0; diff < tickDiffs.length; diff++) {
                    diffTotal += tickDiffs[diff];
                    if (diff == tickDiffs.length - 1) {
                        let tickAvg = diffTotal / tickDiffs.length;

                        // once per beat, update the tempo value in the DOM
                        if (tickCounter % 24 === 0) { document.getElementById("tempo").innerHTML = roundBpm(tickAvg); };
                    }
                }
            };

            tickCounter++; 
        } else {

            // log out non-tick messages for testing 
            //console.log(e.data);

            // push messages to recording array
            // recording.push(e.data);

            // if (recording.length == 100) {
            //     console.log(recording);
            // }
        }; 
    });

    // array in which to record received MIDI events
    let recordedEvents = [];

    // MIDI event listener
    const midiChanMsg = [
        'noteon',
        'noteoff',
        'controlchange',
        'pitchbend',
        'channelmode',
        'programchange',
        'pitchbend'
        // not used:
        //'keyaftertouch',
        //'channelaftertouch'
    ];

    // need to write midi data to some kind of storage, ready for play back.
    // https://github.com/grimmdude/MidiWriterJS

    // listen for 'stop
    input.on('stop', "all", (e) => {
            console.log("Stop!");
        }
    );

    let startTime;
    let recordingActive = false;

    const record = () => {
        console.log('recording!');
        recordingActive = true;
        let startTime = WebMidi.time;
        for (let i = 0; i < midiChanMsg.length; i++) {
            input.addListener(midiChanMsg[i], 'all', (e) => {
                //e.type == 'controlchange' ? console.log(`Channel: ${e.channel}, CC${e.data[1]} ${e.data[2]}, Time: ${e.timestamp}`) : console.log(`Channel: ${e.channel}, Type: ${e.type}, Data: ${e.data}, Time: ${e.timestamp}, Type: ${e.type}`);
                if (recordingActive) {
                    const newTime = (e.timestamp - startTime);
                    console.log(e.timestamp);
                    e.timestamp = newTime;
                    recordedEvents.push(e);

                    console.log(e.timestamp);

                };
            });
        };
    };

    const stopRecording = () => {
        recordingActive = false;
        console.log(recordedEvents);
    };

    // record button
    document.querySelector('.record').addEventListener('click', () => { record(); });

    // stop button
    document.querySelector('.stop').addEventListener('click', () => { stopRecording(); });

    // TODO - add other transport buttons, test playback of recorded midi data
    
    const playback = () => {
        let startTime = WebMidi.time;
        for (let i = 0; i < recordedEvents.length; i++) {

        }
    };
});