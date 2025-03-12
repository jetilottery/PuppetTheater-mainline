/**
 * @module playAgainController
 * @description play again control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus', 
    'skbJet/component/resourceLoader/resourceLib'
    ], function(msgBus,resLib){
    return function (gr,config) {
        function playRestartButton(){
            gr._buttonPlayAgain.visible = false;
            gr._buttonPlayAgainMTM.visible = false;
            msgBus.publish('playAgain');
            msgBus.publish("jLotteryGame.playAgain");
        }

        function onGameParametersUpdated(){
            init();
        }
        
        function init(){
            if(config.wagerType === 'BUY'){
                gr._playAgainText.$text.text = resLib.i18n.game.button_restart;
            }else{
                gr._playAgainText.$text.text = resLib.i18n.game.button_resMTM;
            }
            gr._playAgainMTMText.$text.text = resLib.i18n.game.button_resMTM;
            gr._buttonPlayAgain.on('click', playRestartButton);
            gr._buttonPlayAgainMTM.on('click', playRestartButton);
            gr._buttonPlayAgain.visible = false;
            gr._buttonPlayAgainMTM.visible = false;
        }
        
        function onReInitialize(){
            gr._buttonPlayAgain.visible = false;
            gr._buttonPlayAgainMTM.visible = false;
        }
        
        function onEnterResultScreenState() {
            if (config.jLotteryPhase === 2) {               
                gr._buttonPlayAgain.visible = true;
                gr._buttonPlayAgainMTM.visible = true;
            }
        }
        
        msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe("SKBeInstant.gameParametersUpdated", onGameParametersUpdated);
        return {};
    };
});

