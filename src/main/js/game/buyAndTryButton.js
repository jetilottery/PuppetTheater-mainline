/**
 * @module game/buyAndTryButton
 * @description buy and try button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/audio',
    'skbJet/component/resourceLoader/resourceLib',
    "skbJet/component/SKBeInstant/SKBeInstant",
    "game/gameUtil"
    ], function (msgBus, audio,resLib, SKBeInstant, gameUtils) {
    return function (gr,config) {
        var currentTicketCost = null;
        var replay = false;    
        var MTMReinitial = false; 

        function onGameParametersUpdated(){
            gr._textBuy.$text.text = resLib.i18n.game.button_buy;
            gr._textTry.$text.text = resLib.i18n.game.button_try;
            gr._buttonBuy.visible = false;
            gr._buttonTry.visible = false;
            if (config.wagerType === "BUY") {
                gr._textBuy.$text.text = resLib.i18n.game.button_buy;
            } else {
                gr._textBuy.$text.text = resLib.i18n.game.button_try;
            }
            gr._buttonBuy.on('click',buyOrTryClickEvent);
            gr._buttonTry.on('click',buyOrTryClickEvent);
        }
        function play() {
            if(replay){
				msgBus.publish("jLotteryGame.playerWantsToRePlay", { price: currentTicketCost });
			}else{
                msgBus.publish("jLotteryGame.playerWantsToPlay", { price: currentTicketCost });
			}
            gr._buttonBuy.visible = false;
            gr._buttonTry.visible = false;
            gr._buttonMTM.visible = false;
            audio.play('ButtonGeneric', 0);
            //msgBus.publish("disableUI");
            msgBus.publish('playerBuyOrTry');
        }

        function onStartUserInteraction(data) {
            gr._buttonBuy.visible = false;
            gr._buttonTry.visible = false;
            gr._buttonMTM.visible = false;
            currentTicketCost = data.price;
            replay = true;
        }

        function buyOrTryClickEvent(){
            msgBus.publish('buyOrTryHaveClicked');
            play();
        }

        function showBuyOrTryButton() {
            if (config.jLotteryPhase !== 2) {
                return;
            }
            gr._buttonBuy.visible = true;
            gr._buttonTry.visible = true;
        }

        function onInitialize() {
            showBuyOrTryButton();
        }

        function onTicketCostChanged(data) {
            currentTicketCost = data;
            gameUtils.fixMeter(gr);
        }

        function onPlayerWantsToMoveToMoneyGame(){
            MTMReinitial = true;
        }

        function onReInitialize() {
            if(MTMReinitial){
                gr._textBuy.$text.text = resLib.i18n.game.button_buy;
                replay = false;
                MTMReinitial = false;    
            }
            showBuyOrTryButton();
        }

        function onReStartUserInteraction(data) {
            onStartUserInteraction(data);
        }
		
		function onreset() {
			onReInitialize();
		}
        
        function onPlayAgain(){
            showBuyOrTryButton();
        }

        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe('jLottery.initialize', onInitialize);
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe("jLottery.reStartUserInteraction", onReStartUserInteraction);
        msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
		msgBus.subscribe('jLotterySKB.reset', onreset);
        msgBus.subscribe('playAgain', onPlayAgain);
        msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
        msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
        return {};
    };
});