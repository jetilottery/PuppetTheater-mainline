/**
 * @module game/audio
 * @description audio control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus', 
    "skbJet/component/resourceLoader/resourceLib",
    'com/createjs/easeljs', 
    'com/createjs/soundjs'
    ], function (msgBus,resourceLib) {
    var cjs=window.createjs;
    var sounds = {};
    var registeredSound;
    var gameChannelParam;
    var grClone;
    function popUpEnableAudioDialog(data){
        var mask = document.createElement('div');
        mask.style.width='100%';
        mask.style.height='100%';
        mask.style.backgroundColor='rgba(0,0,0,.9)';
        mask.style.position='absolute';
        mask.style.zIndex=8;
        mask.style.top='0';
        mask.style.left='0';
        document.body.appendChild(mask);
        var panel = document.createElement('div');
        panel.style.width='240px';
        panel.style.height='100px';
        panel.style.backgroundColor='black';
        panel.style.border='2px solid white';
        panel.style.borderRadius='14px';
        panel.style.position='absolute';
        panel.style.zIndex=10;
        panel.style.top='50%';
        panel.style.left='50%';
        panel.style.marginTop='-50px';
        panel.style.marginLeft='-122px';
        mask.appendChild(panel);
        var p=document.createElement('p');
        p.style.width='220px';
        p.style.height='40px';
        p.style.margin='10px';
        p.style.color='white';
        p.style.font='normal 20px Arial';
        p.style.textAlign='center';
        p.innerHTML=data.query;
        panel.appendChild(p);
        var yesBtn=document.createElement('button');
        yesBtn.style.width='60px';
        yesBtn.style.height='26px';
        yesBtn.style.backgroundColor='#DDDDDD';
        yesBtn.style.border='2px solid white';
        yesBtn.style.borderRadius='5px';
        yesBtn.style.float='left';
        yesBtn.style.marginLeft='33px';
        yesBtn.style.color='balck';
        yesBtn.innerHTML=data.yes;
        yesBtn.id='audio_btn_YES';
        panel.appendChild(yesBtn);
        var noBtn=document.createElement('button');
        noBtn.style.width='60px';
        noBtn.style.height='26px';
        noBtn.style.backgroundColor='#DDDDDD';
        noBtn.style.border='2px solid white';
        noBtn.style.borderRadius='5px';
        noBtn.style.float='right';
        noBtn.style.marginRight='33px';
        noBtn.style.color='balck';
        noBtn.innerHTML=data.no;
        noBtn.id='audio_btn_NO';
        panel.appendChild(noBtn);      
        
        function stopPropagation(event){
            var evt = event ? event:window.event;
            evt.stopPropagation();
            evt.cancelBubble = true;
        }		
            
        function playerAudioChoice(event){
            stopPropagation(event);
            document.body.removeChild(mask);
            var audioEnabled = false;
            if(this.id==='audio_btn_YES'){
                audioEnabled = true;
            }
            cjs.Sound.muted = !audioEnabled;
            registerSound(audioEnabled);
            onPlayerSelectedAudioWhenGameLaunch(audioEnabled);
        }
        
        yesBtn.addEventListener('click',playerAudioChoice);
        noBtn.addEventListener('click',playerAudioChoice);
        mask.addEventListener('click',stopPropagation);
    }

    function onBeforeShowStage() {
        if (!registeredSound) {
            if (gameChannelParam !== 'INT') {//if mobile or tablet, add rotate animation css
                var data = {
                    "query": resourceLib.i18n.game.audioLoader.confirm,
                    "yes": resourceLib.i18n.game.audioLoader.yes,
                    "no": resourceLib.i18n.game.audioLoader.no
                };
                popUpEnableAudioDialog(data);
                cjs.Sound.muted = true;
                onPlayerSelectedAudioWhenGameLaunch(false);
            } else {
                registerSound(true);
                setTimeout(function () {
                    cjs.Sound.muted = false;
                    onPlayerSelectedAudioWhenGameLaunch(true);
                }, 20);
            }
        }
    }

    function onPlayerSelectedAudioWhenGameLaunch(data){
        cjs.Sound.muted = data;
        audioSwitch();
    }
    
    function onSystemInit(data){
        gameChannelParam = data.serverConfig.channel;
    }

    function registerSound(audioEnabled){
        var soundText = "Sound";
        var soundOn = "On", soundOff = "Off";
        registeredSound = true;
        if(resourceLib.i18n.game.MenuCommand.audio){
            soundText = resourceLib.i18n.game.MenuCommand.audio.sound;
            soundOn = resourceLib.i18n.game.MenuCommand.audio.on;
            soundOff = resourceLib.i18n.game.MenuCommand.audio.off;
        }
        
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                "options":[{
                    "name":"sound",
                    "text":soundText,
                    "type":"list",
                    "enabled":1,
                    "value":audioEnabled?0:1,
                    "values":["0","1"],
                    "valueText":[soundOn, soundOff]
                }]
            }
        });
    }

    function gameAudioControlChanged(mute) {
        var value = 0;
        if (mute) {
            value = 1;
        }
        msgBus.publish("toPlatform", {
            channel: "Game",
            topic: "Game.Control",
            data: {name: "sound", event: "change", params: [value]}
        });
    }

    function consoleAudioControlChanged(data) {
        var isMuted = false;
        if (data.option === "sound" && data.value === "1") {
            isMuted = true;
        }
        return isMuted;
    }
    
    function onConsoleControlChanged(data) {
        if (data.option === 'sound') {
            var isMuted = consoleAudioControlChanged(data);
            if(isMuted) {
                grClone._buttonAudioOff.visible = true;
                grClone._buttonAudioOn.visible = false;
                cjs.Sound.muted = true;
            } else{
                grClone._buttonAudioOn.visible = true;
                grClone._buttonAudioOff.visible = false;
                cjs.Sound.muted = false;                  
            }  
        } 
    }

    function onMuteChange(data){
        if(data.option==="sound"){
            cjs.Sound.muted = (data.value==="1");
        }
    }

    function play(id, loop) {
        sounds[id] = cjs.Sound.play(id, {loop: loop});
    }
    
    function stop(id){
        sounds[id].stop();
    }

    //When error happened, audio should be muted.
    //Add one function to mute audio.
    function muteAudio() {
        if (!cjs.Sound.muted) {
            //gr._buttonAudio.$backgroundImage.gotoAndStop('buttonAudioOff');
            cjs.Sound.muted = true;
            grClone._buttonAudioOn.visible = false;
            grClone._buttonAudioOff.visible = true;
        }
    }

    function audioSwitch() {
        if (cjs.Sound.muted) {
            grClone._buttonAudioOn.visible = true;
            grClone._buttonAudioOff.visible = false;
            cjs.Sound.muted = false;
        } else {
            grClone._buttonAudioOn.visible = false;
            grClone._buttonAudioOff.visible = true;
            cjs.Sound.muted = true;
        }
        gameAudioControlChanged(cjs.Sound.muted);
    }

    function audio(gr, config) {
        grClone = gr;
        if (config.soundStartDisabled) {
            cjs.Sound.muted = true;
            gr._buttonAudioOn.visible = false;
            gr._buttonAudioOff.visible = true;
        } else {
            gr._buttonAudioOn.visible = true;
            gr._buttonAudioOff.visible = false;
            cjs.Sound.muted = false;
        }

        gr._buttonAudioOn.on('click', audioSwitch);
        gr._buttonAudioOff.on('click', audioSwitch);

		function onReInitialize(){
			if(sounds.BaseMusicLoop){
			    sounds.BaseMusicLoop.stop();
			}
		}

        function onStartUserInteraction() {
            if(config.gameType === 'ticketReady' && config.assetPack !== 'desktop'){
			    return;
		    }
            if (!sounds['BaseMusicLoop'] || sounds['BaseMusicLoop'].playState !== 'playSucceeded') {//PLAY_SUCCEEDED
                play('BaseMusicLoop', -1);
            }
        }

        function onEnterResultScreenState() {
            if (sounds['BaseMusicLoop']) {
                sounds['BaseMusicLoop'].stop();
            }
        }

        function onReStartUserInteraction() {
            play('BaseMusicLoop', -1);
        }

        function onreset() {
			onReInitialize();
		}

        msgBus.subscribe('platformMsg/Kernel/System.Init', onSystemInit);
        msgBus.subscribe('platformMsg/ConsoleService/Game.Control', onMuteChange);
        msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
        msgBus.subscribe("onBeforeShowStage", onBeforeShowStage);
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
        msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
		msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe('jLotterySKB.reset', onreset);

        return {};
    }

    audio.play = play;
    audio.stop = stop;
    audio.muteAudio = muteAudio;

    return audio;
});