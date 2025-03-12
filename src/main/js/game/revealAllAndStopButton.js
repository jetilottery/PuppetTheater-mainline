/**
 * @module game/revealAllButton
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/audio', 
    'skbJet/component/resourceLoader/resourceLib',
    'com/createjs/easeljs',
    'com/createjs/tweenjs'
    ], function(msgBus,audio,resLib){
    return function (gr,config) {    
        var revListener = [];   
        var stopListener = [];
        var revealAllIsClicked = false;
        var revListenerMTM = [];
        var stopListenerMTM = [];
        function onGameParametersUpdated(){
            gr._buttonAutoPlay.visible = false;
            gr._buttonAutoPlayMTM.visible = false;
            gr._buttonCancel.visible = false;
            gr._buttonCancelMTM.visible = false;
        }
        
        function resetAll() {
            for (var i = 0; i < revListener.length; i++) {
                gr._buttonAutoPlay.off('click', revListener[i]);
            }
            for(var i=0; i< stopListener.length; i++){
                gr._buttonCancel.off('click', stopListener[i]);
            }
            for(var i = 0; i < revListenerMTM.length; i++){
                gr._buttonAutoPlayMTM.off('click', revListenerMTM[i]);
            }
            for(var i=0; i< stopListenerMTM.length; i++){
                gr._buttonCancelMTM.off('click', stopListenerMTM[i]);
            }
            revealAllIsClicked = false;
        }

        function onStartUserInteraction(data) {
            gr._autoPlayText.$text.text = resLib.i18n.game.button_auto;
            gr._autoPlayMTMText.$text.text = resLib.i18n.game.button_auto;
            gr._cancelText.$text.text = resLib.i18n.game.button_cancel;
            gr._cancelMTMText.$text.text = resLib.i18n.game.button_cancel;
            var enable = config.autoRevealEnabled === false? false: true;
            if(enable){
                if(data.scenario){
                    gr._buttonAutoPlay.visible = true;
                    gr._buttonAutoPlayMTM.visible = true;
                }
            }else{
                gr._buttonAutoPlay.visible = false;
                    gr._buttonAutoPlayMTM.visible = false;
            }

            function revealAll() {
                msgBus.publish('disableUI');
                msgBus.publish('startRevealAll');
                
                gr._buttonAutoPlay.visible = false;
                gr._buttonAutoPlayMTM.visible = false;
                gr._buttonCancel.visible = true;
                gr._buttonCancelMTM.visible = true;
                revealAllIsClicked = true;
            }
            function stop(){
                msgBus.publish('stopRevealAll');
                gr._buttonCancel.visible = false;
                gr._buttonCancelMTM.visible = false;
                gr._buttonAutoPlay.visible = true;
                gr._buttonAutoPlayMTM.visible = true;
                revealAllIsClicked = false;
            }

            revListener.push(gr._buttonAutoPlay.on('click', revealAll));
            revListener.push(gr._buttonAutoPlay.on('click', function () {
                audio.play('ButtonGeneric', 0);
            }));
            revListenerMTM.push(gr._buttonAutoPlayMTM.on('click', revealAll));
            revListener.push(gr._buttonAutoPlayMTM.on('click', function () {
                audio.play('ButtonGeneric', 0);
            }));
            gr._buttonAutoPlay.visible = true;
            gr._buttonAutoPlayMTM.visible = true;
            
            stopListener.push(gr._buttonCancel.on('click', stop));
            stopListenerMTM.push(gr._buttonCancelMTM.on('click', stop));
        }

        function onReStartUserInteraction(data) {
            resetAll();
            onStartUserInteraction(data);
        }

        function onReInitialize() {
            resetAll();
            gr._buttonAutoPlay.visible = false;
            gr._buttonCancel.visible = false;
            gr._buttonAutoPlayMTM.visible = false;
            gr._buttonCancelMTM.visible = false;
        }
		
		function onreset() {
			onReInitialize();
		}	
        
        function onBonus(){
            gr._buttonAutoPlay.visible = false;
            gr._buttonCancel.visible = false;
            gr._buttonAutoPlayMTM.visible = false;
            gr._buttonCancelMTM.visible = false;
        }

        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe('allRevealed', function () {
            gr._buttonAutoPlay.visible = false;
            gr._buttonAutoPlayMTM.visible = false;
            gr._buttonCancel.visible = false;
            gr._buttonCancelMTM.visible = false;
        });
		msgBus.subscribe('jLotterySKB.reset', onreset);
        msgBus.subscribe('bonus',onBonus);
        msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
        return {};
    };
});