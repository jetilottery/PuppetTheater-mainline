/**
 * @module game/resultDialog
 * @description result dialog control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus', 
    'game/audio', 
    'skbJet/component/resourceLoader/resourceLib',
    "skbJet/component/SKBeInstant/SKBeInstant"
    ], function (msgBus, audio,resLib,SKBeInstant) {
    return function (gr, config, jLottery) {
        var allPuppetsRevealed = false;
        var resultData = null;
        var winFlag;
        var loseFlag;
        var resultStateFlag = false;

        function resetAll(){
            winFlag = false;
            loseFlag = false;
        }

        function hideDialog() {
            gr._BG_dim.visible = false;
            gr._MessagePlaque.visible = false;
        }

        function audioFlag(audioName){
            audio.play(audioName, 0);
            if(audioName === 'BaseMusicLoopTermLose'){
                loseFlag = true;
                winFlag = false;
            } else{
                loseFlag = false;
                winFlag = true;    
            }
        }

        function showDialog() {
            gr._BG_dim.visible = true;
            gr._MessagePlaque.visible = true;
            gr._buttonCloseText02.$text.text=resLib.i18n.game.button_Close;
            gr._Message01_Text.$text.text = '';
            gr._Message01_Try_Text.$text.text = '';
            gr._Message01_Value.$text.text = '';
            gr._Message02_Text.$text.text = '';
            if (resultData.playResult === 'WIN') {
                if (config.wagerType === 'BUY') {
                    gr._Message01_Text.$text.text = resLib.i18n.game.message_buyWin;
                } else {
                    gr._Message01_Try_Text.$text.text = Number(config.demosB4Move2MoneyButton) !== -1?resLib.i18n.game.message_tryWin:resLib.i18n.game.message_anonymousTryWin;
                }
               // gr._Message01_Text.$text.lineHeight = 55;
                gr._Message01_Value.$text.text = SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount;
                audioFlag('BaseMusicLoopTermWin');
            } else {
                gr._Message02_Text.$text.text = resLib.i18n.game.message_nonWin;
                audioFlag('BaseMusicLoopTermLose');
            }
        }

        function onStartUserInteraction(data) {
            resultData = data;
            allPuppetsRevealed = false;
            hideDialog();
        }

        function checkAllRevealed() {
            if (allPuppetsRevealed) {
                jLottery.ticketResultHasBeenSeen(resultData.prizeDivision, resultData.prizeValue);
                msgBus.publish('disableUI');
                msgBus.publish('allRevealed');
            }
        }

        function onEnterResultScreenState() {
            resultStateFlag = true;
            msgBus.publish('enableUI');
            showDialog();
        }

        function onReStartUserInteraction(data) {
            resetAll();
            onStartUserInteraction(data);
        }

        function onReInitialize() {
            resetAll();
            hideDialog();
        }

        function onreset() {
			onReInitialize();
		} 
        
        function onPlayAgain(){
            resultStateFlag = false;
            hideDialog();
        }
        
        function onOpenTutorial(){
            hideDialog();
        }

        function onCloseTutorial(){
            if(resultStateFlag){
                gr._BG_dim.visible = true;
                gr._MessagePlaque.visible = true;
            }
        }

        msgBus.subscribe('jLottery.reInitialize', onReInitialize);

        msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
        msgBus.subscribe('allPuppetsRevealed', function () {
            allPuppetsRevealed = true;
            checkAllRevealed();
        });
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
		msgBus.subscribe('jLotterySKB.reset', onreset);
        msgBus.subscribe('playAgain', onPlayAgain);
        msgBus.subscribe('openTutorial',onOpenTutorial);
        msgBus.subscribe('closeTutorial',onCloseTutorial);

        gr._MessagePlaque.on('click', function () {                      
            hideDialog();
            audio.play('ButtonGeneric', 0);
            if(loseFlag){
                audio.stop('BaseMusicLoopTermLose');
            }
            if(winFlag){
                audio.stop('BaseMusicLoopTermWin');
            }
        });

        hideDialog();
        resetAll();
        return {};
    };
});