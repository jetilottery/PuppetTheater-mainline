/**
 * @module game/playWithMoney
 * @description play with money button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus', 
    'game/audio', 
    'skbJet/component/resourceLoader/resourceLib',
    'game/playAgainController'
    ], function(msgBus,audio,resLib){
    return function (gr, config, jLottery) {      
        var count = 0;
        var inGame = false;             
        var uiEnableFlag = true;
        function onGameParametersUpdated(){
            gr._MTMText.$text.text = resLib.i18n.game.button_move2moneyGame;           
            gr._buttonMTM.visible = false;         
            function clickMTM(){
                if(!uiEnableFlag){
                    return;
                }
                gr._buttonMTM.visible = false;
                config.wagerType = 'BUY';
                jLottery.playerWantsToMoveToMoneyGame();
                audio.play('ButtonGeneric',0);
            }
            gr._buttonMTM.on('click', clickMTM);          
        }

        function enableButton() {
            if ((config.wagerType === 'BUY') || (config.jLotteryPhase === 1) || (Number(config.demosB4Move2MoneyButton) === -1/*-1: never. Move-To-Money-Button will never appear.*/)) {
                gr._buy.visible = true;
                gr._try.visible = false;
            } else {
                //0: Move-To-Money-Button shown from the beginning, before placing any demo wager.
                //1..N: number of demo wagers before showing Move-To-Money-Button.
                //(Example: If value is 1, then the first time the RESULT_SCREEN state is reached, 
                //the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))
                if (count >= Number(config.demosB4Move2MoneyButton)){
                    gr._buy.visible = false;
                    gr._try.visible = true;
                    gr._buttonMTM.visible = true;                   
                } else{
                    gr._buy.visible = true;
                    gr._try.visible = false;
                }
            }
        }

        function onInitialize() {
            enableButton();
        }

        function onStartUserInteraction() {
            inGame = true;
            if (!config.moveToMoneyButtonEnabledWhilePlaying){
                gr._buttonMTM.visible = false;
            }
            if(config.gameType === 'normal'){
                gr._buy.visible = true;
                gr._try.visible = false;
            }
        }

        function onReStartUserInteraction() {
           inGame = true;
           gr._buy.visible = true;
           gr._try.visible = false;

        }

        function onDisableUI() {
            uiEnableFlag = false;
            gr._buttonMTM.visible = false;
        }
        
        function onEnableUI(){
            uiEnableFlag = true;
            gr._buttonMTM.visible = true;
        }
        
        function onEnablePlayWithMoneyUI(){
            enableButton();
        }

        //When the RESULT_SCREEN state is reached,plus count,
        //the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))                
        function onEnterResultScreenState() {
            inGame = false;
            if (config.wagerType === 'TRY') {
                count++;
                setTimeout(enableButton, Number(config.compulsionDelayInSeconds) * 1000);
            }
        }
        
        function onreset() {
			inGame = false;
            enableButton();
		}
        
        function onOpenTutorial(){
            gr._buy.visible = false;
            gr._try.visible = false;
        }
        
        function onCloseTutorial(){
            if(inGame){
                gr._buy.visible = true;
                gr._try.visible = false;
            } else{
                enableButton();
            }
        }

        function onReInitialize(){
            inGame = false;
            enableButton();        
        }

        msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
        msgBus.subscribe('jLottery.initialize', onInitialize);
        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe('disableUI', onDisableUI);
        msgBus.subscribe('enableUI', onEnableUI);
        msgBus.subscribe('enablePlayWithMoneyUI', onEnablePlayWithMoneyUI);
        msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
        msgBus.subscribe('jLotterySKB.reset', onreset);
        msgBus.subscribe('openTutorial', onOpenTutorial);
        msgBus.subscribe('closeTutorial', onCloseTutorial);
        msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
        return {};
    };
});