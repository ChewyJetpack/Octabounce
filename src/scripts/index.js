import '../styles/index.scss';
import WebMidi from "webmidi";

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
    console.log('MIDI_CHANNEL_MESSAGES:', WebMidi.MIDI_CHANNEL_MESSAGES);
    console.log('MIDI_CHANNEL_MODE_MESSAGES:', WebMidi.MIDI_CHANNEL_MODE_MESSAGES);
    console.log('MIDI_CONTROL_CHANGE_MESSAGES:', WebMidi.MIDI_CONTROL_CHANGE_MESSAGES);
    console.log('MIDI_NRPN_MESSAGES:', WebMidi.MIDI_NRPN_MESSAGES);
    console.log('MIDI_REGISTERED_PARAMETER:', WebMidi.MIDI_REGISTERED_PARAMETER);
    console.log('MIDI_SYSTEM_MESSAGES:', WebMidi.MIDI_SYSTEM_MESSAGES);
};



const detectTempo = (input) => {

    // number of ticks elapsed
    let tickCounter = 0;

    // tick timestamps
    let tickTimes = [];

    // time between ticks
    let tickDiffs = [];

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
        }; 
    });
};

WebMidi.enable((err) => {

    WebMidiSetup();

    // hard coded midi device - {todo} make this user-selectable
    const input = WebMidi.getInputById('981459792');
    const output = WebMidi.getOutputById('-1764261658');

    detectTempo(input);

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

    const dataPool = {
        status: 'waiting',
        recordedEvents: []
    };

    const helpers = {        
        updateStatus: (status) => {
            const statusMsg = document.getElementById('status');
            switch (status) {
                case 'recording':
                    dataPool.status = 'recording';
                    statusMsg.innerHTML = `Press the stop button when you're finished.`;
                break;
                case 'stopped':
                    dataPool.status = 'stopped';
                    statusMsg.innerHTML = `Ready to bounce! To clear your recording, press the stop button again.`;
                break;
                default:
                    dataPool.status = 'waiting';
                    statusMsg.innerHTML = `Press the play button to start recording your performance.`;
                break;
            }
        }
    };

    // functions related to the recording of MIDI data
    const recordMIDI = {
        run: () => {
            // log the time the recording was started
            const startTime = WebMidi.time;

            // update the status
            helpers.updateStatus('recording');

            // loop through all midi message types we want to record, and add listeners for each, to record the messages
            for (let i = 0; i < midiChanMsg.length; i++) {
                input.addListener(midiChanMsg[i], 'all', (e) => {

                    // if recording is active, get the message data, set the correct timestamp, and push to the array
                    if (status == 'recording') {
                        this.newTime = (e.timestamp - startTime);
                        console.log(e.timestamp);
                        e.timestamp = this.newTime;
                        recordedEvents.push(e);
                        console.log(e.timestamp);
                    };
                });
            };
        },
        stopRecording: () => {
            if (dataPool.status == 'recording') { console.log(dataPool.recordedEvents); }; 
            helpers.updateStatus('stopped');
        },
        resetRecording: () => {
            dataPool.recordedEvents = [];
            helpers.updateStatus('waiting');
        }
    };

    // listen for 'play'
    input.on('start', "all", () => {  
        recordMIDI.run(); 
    });

    // listen for 'play'
    input.on('stop', "all", () => {  
        dataPool.status == 'recording' ? recordMIDI.stopRecording() : recordMIDI.resetRecording();
    });

    // TODO - add other transport buttons, test playback of recorded midi data
    
    const playback = () => {
        let startTime = WebMidi.time;
        for (let i = 0; i < dataPool.recordedEvents.length; i++) {

        }
    };
});