/**
 * @module game/exitButton
 * @description exit button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus', 
    'game/audio', 
    'skbJet/component/resourceLoader/resourceLib',
    'skbJet/component/SKBeInstant/SKBeInstant'
    ], function (msgBus, audio,resLib, SKBeInstant) {
    return function (gr, config, jLottery) {
        var isWLA = false;
        var whilePlaying=false;
        function exitButton() {
            audio.play('ButtonGeneric', 0);
            jLottery.playerWantsToExit();
        }
        function onGameParametersUpdated() {
            isWLA = SKBeInstant.isWLA()? true:false;
            gr._buttonExit.visible = false;
            gr._buttonExit.on('click',exitButton);
            gr._buttonHome.on('click',exitButton);
            gr._exitText.$text.text = resLib.i18n.game.button_exit;
            if(config.jLotteryPhase === 1){
                gr._buttonHome.visible = false;
            }else{
                gr._buttonHome.visible = true;
            }
        }

        function onInitialize(){
            if(isWLA){
                if(Number(SKBeInstant.config.jLotteryPhase) === 1){
                    gr._buttonHome.visible = false;
                }else{
                    gr._buttonHome.visible = true;
                }
            }
        }
        
        function onEnterResultScreenState() {
            if (Number(config.jLotteryPhase) === 1) {
                gr._buttonExit.visible = true;
            }else{
                setTimeout(function () {
                    whilePlaying = false;
                    if(isWLA){gr._buttonHome.visible =true;}
                }, Number(config.compulsionDelayInSeconds) * 1000);
            }
        }

        function onEnableUI() {
            if(Number(config.jLotteryPhase) === 2  && isWLA && !whilePlaying){
                gr._buttonHome.visible = true;
            }
        }
        
        function onDisableUI(){
            gr._buttonHome.visible = false;
        }

        function onReInitialize(){
            whilePlaying = false;
            if(isWLA){gr._buttonHome.visible = true;}       
        }
        
        function onOpenTutorial(){
            gr._buttonHome.visible = false;
        }
        
        function onCloseTutorial(){
            if(Number(config.jLotteryPhase) === 2 && !whilePlaying && isWLA){
                gr._buttonHome.visible = true;
            }
        }
        
        function onStartUserInteraction(){
            whilePlaying = true;
            if (isWLA){
                gr._buttonHome.visible = false;
            }
        }
        
        function onReStartUserInteraction(data){
            onStartUserInteraction(data);
        }
        
        function onStopRevealAll(){
            if(config.jLotteryPhase === 2){
                gr._buttonHome.visible = true;
            }
        }

        msgBus.subscribe('enableUI', onEnableUI);
        msgBus.subscribe('disableUI', onDisableUI);
        msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
        msgBus.subscribe('openTutorial',onOpenTutorial);
        msgBus.subscribe('closeTutorial', onCloseTutorial);
        msgBus.subscribe('jLottery.initialize', onInitialize);
        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe('stopRevealAll', onStopRevealAll);
        msgBus.subscribe('bonus',onDisableUI);
        msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
        return {};
    };
});