	var win = $.index;
	var myRecording = null;
	var TOKEN = '6ZFMPXYUUIEDX2JCMXC63N74MLHZ5QEL';
	
	var currentSessionMode = Titanium.Media.audioSessionMode;
	Titanium.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAY_AND_RECORD;
	var recording = Ti.Media.createAudioRecorder();
	
	// default compression is Ti.Media.AUDIO_FORMAT_LINEAR_PCM
	// default format is Ti.Media.AUDIO_FILEFORMAT_CAF
	
	// this will give us a wave file with µLaw compression which
	// is a generally small size and suitable for telephony recording
	// for high end quality, you'll want LINEAR PCM - however, that
	// will result in uncompressed audio and will be very large in size
	recording.compression = Ti.Media.AUDIO_FORMAT_ULAW;
	recording.format = Ti.Media.AUDIO_FILEFORMAT_WAVE;
	
	Ti.Media.addEventListener('recordinginput', function(e) {
		Ti.API.info('Input availability changed: '+e.available);
		if (!e.available && recording.recording) {
			b1.fireEvent('click', {});
		}
	});
	
	win.addEventListener('close',function(e) {
		Titanium.Media.audioSessionMode = currentSessionMode;
	});
	
	var file;
	var timer;
	var sound;
	
	
	var label = Titanium.UI.createLabel({
		text:'',
		top:150,
		color:'#999',
		textAlign:'center',
		width:Ti.UI.SIZE,
		height:Ti.UI.SIZE
	});
	
	win.add(label);
	
	function lineTypeToStr()
	{
		var type = Ti.Media.audioLineType;
		switch(type)
		{
			case Ti.Media.AUDIO_HEADSET_INOUT:
				return "headset";
			case Ti.Media.AUDIO_RECEIVER_AND_MIC:
				return "receiver/mic";
			case Ti.Media.AUDIO_HEADPHONES_AND_MIC:
				return "headphones/mic";
			case Ti.Media.AUDIO_HEADPHONES:
				return "headphones";
			case Ti.Media.AUDIO_LINEOUT:
				return "lineout";
			case Ti.Media.AUDIO_SPEAKER:
				return "speaker";
			case Ti.Media.AUDIO_MICROPHONE:
				return "microphone";
			case Ti.Media.AUDIO_MUTED:
				return "silence switch on";
			case Ti.Media.AUDIO_UNAVAILABLE:
				return "unavailable";
			case Ti.Media.AUDIO_UNKNOWN:
				return "unknown";
		}
	}
	
	var linetype = Titanium.UI.createLabel({
		text: "audio line type: "+lineTypeToStr(),
		bottom:20,
		color:'#999',
		textAlign:'center',
		width:Ti.UI.SIZE,
		height:Ti.UI.SIZE
	});
	
	win.add(linetype);
	
	var volume = Titanium.UI.createLabel({
		text: "volume: "+Ti.Media.volume,
		bottom:50,
		color:'#999',
		textAlign:'center',
		width:Ti.UI.SIZE,
		height:Ti.UI.SIZE
	});
	
	win.add(volume);
	
	Ti.Media.addEventListener('linechange',function(e)
	{
		linetype.text = "audio line type: "+lineTypeToStr();
	});
	
	Ti.Media.addEventListener('volume',function(e)
	{
		volume.text = "volume: "+e.volume;
	});
	
	var duration = 0;
	
	function showLevels()
	{
		var peak = Ti.Media.peakMicrophonePower;
		var avg = Ti.Media.averageMicrophonePower;
		duration++;
		label.text = 'duration: '+duration+' seconds\npeak power: '+peak+'\navg power: '+avg;
	}
	
	var b1 = Titanium.UI.createButton({
		title:'Start Recording',
		width:200,
		height:40,
		top:20
	});
	b1.addEventListener('click', function()
	{
		if (recording.recording)
		{
			file = recording.stop();
			
			if(file != null) {
        	alert('File is exists!');
        		//Ti.API.info(Ti.Utils.base64encode(myRecording.read()));
        		innerExecute('speech','', file.read(), onSuccessRes, onErrorRes, onFailureRes);
        	}else{
       		 alert('Nothing is recorded!');
       		 }
			
			//console.log(file.path);
			//var f = Ti.Filesystem.getFile(file.path);
        	//var m = f.move(Ti.Filesystem.applicationDataDirectory + '/audio.m4a');
			b1.title = "Start Recording";
			b2.show();
			pause.hide();
			clearInterval(timer);
			Ti.Media.stopMicrophoneMonitor();
		}
		else
		{
			if (!Ti.Media.canRecord) {
				Ti.UI.createAlertDialog({
					title:'Error!',
					message:'No audio recording hardware is currently connected.'
				}).show();
				return;
			}
			b1.title = "Stop Recording";
			recording.start();
			b2.hide();
			pause.show();
			Ti.Media.startMicrophoneMonitor();
			duration = 0;
			timer = setInterval(showLevels,1000);
		}
	});
	win.add(b1);
	
	var pause = Titanium.UI.createButton({
		title:'Pause recording',
		width:200,
		height:40,
		top:80
	});
	win.add(pause);
	pause.hide();
	
	pause.addEventListener('click', function() {
		if (recording.paused) {
			pause.title = 'Pause recording';
			recording.resume();
			timer = setInterval(showLevels,1000);
		}
		else {
			pause.title = 'Unpause recording';
			recording.pause();
			clearInterval(timer);
		}
	});
	
	var b2 = Titanium.UI.createButton({
		title:'Playback Recording',
		width:200,
		height:40,
		top:80
	});
	
	win.add(b2);
	b2.hide();
	b2.addEventListener('click', function()
	{
		if (sound && sound.playing)
		{
			sound.stop();
			sound.release();
			sound = null;
			b2.title = 'Playback Recording';
		}
		else
		{
			Ti.API.info("recording file size: "+file.size);
			sound = Titanium.Media.createSound({url:file});
			sound.addEventListener('complete', function()
			{
				b2.title = 'Playback Recording';
			});
			sound.play();
			b2.title = 'Stop Playback';
		}
	});
	
	var switchLabel = Titanium.UI.createLabel({
		text:'Hi-fidelity:',
		width:Ti.UI.SIZE,
		height:Ti.UI.SIZE,
		textAlign:'center',
		color:'#999',
		bottom:115
	});
	var switcher = Titanium.UI.createSwitch({
		value:false,
		bottom:80
	});
	
	switcher.addEventListener('change',function(e)
	{
		/*if (!switcher.value)
		{
			recording.compression = Ti.Media.AUDIO_FORMAT_ULAW;
		}
		else
		{
			recording.compression = Ti.Media.AUDIO_FORMAT_LINEAR_PCM;
		}*/
		myRecording = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'FA53.wav');
		Ti.API.info(Ti.Filesystem.applicationDataDirectory);
		
        if(myRecording != null) {
        alert('File is exists!');
        //Ti.API.info(Ti.Utils.base64encode(myRecording.read()));
        innerExecute('speech','', myRecording.read(), onSuccessRes, onErrorRes, onFailureRes);
        }else{
        alert('Nothing is recorded!');
        }
       /*var postBody = {"name":"flight_request_to","doc":"detect flight request","expressions":[{
          "body" : "fly from incheon to sfo1"
        }, {
          "body" : "I want to fly from london to sfo1"
        },{
          "body" : "need a flight from paris to tokyo1"
        }]};
       innerExecute('intents','', postBody, onSuccessRes, onErrorRes, onFailureRes);*/
	});
	win.add(switchLabel);
	win.add(switcher);

function onSuccessRes(data){
	Ti.API.info("Result " + data);
	$.label.text = data;
}

function onErrorRes(data){
	Ti.API.info("Result on Error:: " + JSON.stringify(data));
}

function onFailureRes(data){
	Ti.API.info("Result on Failure:: " + JSON.stringify(data));
}

function innerExecute(serviceName, urlSuffix, parameters, onSuccess, onError, onFailure) {
	// Changing the timeout to 120000 from 50000 to compensate for delays on DEV5 and UAT.
	var HTTP_TIMEOUT = 1000 * 60 * 2;
	//2 minutes
	var HTTP_KEEPALIVE_ENABLED = true;
	//var HTTP_KEEPALIVE_ENABLED = false;

	var ACCEPT_JSON = "application/json";
	var serviceTimeout = HTTP_TIMEOUT;
	var url = 'https://api.wit.ai/'+ serviceName +'?v=20141022';
	if (urlSuffix) {
		url = url + urlSuffix;
	}
	var method = (!parameters) ? "GET" : "POST";

	var http = Titanium.Network.createHTTPClient({
		enableKeepAlive : HTTP_KEEPALIVE_ENABLED,
		timeout : serviceTimeout,
		onload : function(e) {

			try {
				var result;
					result = this.responseData;
					Ti.API.info(e);
					Ti.API.info(result);
					Ti.API.info(this.status);
					if (onSuccess) {
						onSuccess(result, this.status);
					}

			} catch(e) {
				Ti.API.info('createHTTPClient onload response: ' + this.responseText);
				Ti.API.info("TEST2:: " + JSON.stringify(this));
				Ti.API.info("TEST2:: " + this.allResponseHeaders);

				if (onSuccess) {
					onSuccess(result, this.status);
				}
			}
		},
		onerror : function(e) {
			Ti.API.info("TEST3:: " + JSON.stringify(this));
			Ti.API.info("TEST3:: " + this.allResponseHeaders);

			if (e.error.indexOf('Unable to resolve host') != -1 || e.error.indexOf('hostname could not be found') != -1) {
				// cannot resolve host
				if (onFailure) {
					onFailure(e, this.status);
				}
			} else if (this.status === 500) {
				// Internal server error. Nothing wrong with app's code
				if (onFailure) {
					onFailure(this.responseText, this.status);
				}
			} else if (this.status == 0 || this.status > 400 || e.error.indexOf('Timeout') != -1) {
				// timeout
				if (onFailure) {
					onFailure(e, this.status);
				}
			} else if (onError) {
				var result = JSON.parse(this.responseText);
				// all other 400 errors go to the callback
				onError(result, this.status);
			}
		}
	});

	http.open(method, url);

	setRequestHeaders(http);

	if (parameters) {
		var post_body = JSON.stringify(parameters);
		//Ti.API.info(parameters);
		http.send(parameters);
	} else {
		http.send();
	}
}

function setRequestHeaders(http) {
	//http.setRequestHeader("Accept", acceptHeader);

	http.setRequestHeader("Authorization", "Bearer "+ TOKEN);
	//http.setRequestHeader("Content-Type", "application/json");
	http.setRequestHeader("Content-Type", "audio/wav");
}



function doClick(e) {
    alert($.label.text);
}

win.open();
