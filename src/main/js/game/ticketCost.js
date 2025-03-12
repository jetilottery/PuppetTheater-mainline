/**
 * @module game/ticketCost
 * @description ticket cost meter control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/audio', 
    'skbJet/component/resourceLoader/resourceLib',
    "game/gameUtil", 
    'skbJet/component/SKBeInstant/SKBeInstant'
    ], function(msgBus,audio,resLib,gameUtil,SKBeInstant){  
    return function (gr, config) {
        var ticketIcon={}, ticketIconObj = null;         
        gr._ticketCostText.$text.text = resLib.i18n.game.wager;
        var prizePointList = [];
        var _currentPrizePoint = null;
        var ticketPrice = 7;

        function registerControl() {
            var formattedPrizeList = [];
            var strPrizeList = [];
            for (var i = 0; i < prizePointList.length; i++) {
                formattedPrizeList.push(SKBeInstant.formatCurrency(prizePointList[i]).formattedAmount);
                strPrizeList.push(prizePointList[i] + '');
            }
            var priceText, stakeText;
            if (SKBeInstant.isWLA()) {
                priceText = resLib.i18n.game.MenuCommand.WLA.price;
                stakeText = resLib.i18n.game.MenuCommand.WLA.stake;
            } else {
                priceText = resLib.i18n.game.MenuCommand.Commercial.price;
                stakeText = resLib.i18n.game.MenuCommand.Commercial.stake;
            }
		    msgBus.publish("jLotteryGame.registerControl", [
                {
                    name: "price",
                    text: priceText,
                    type: "list",
                    enabled: 1,
                    valueText: formattedPrizeList,
                    values: strPrizeList,
                    value: SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault
                }
            ]);
            msgBus.publish("jLotteryGame.registerControl", [
                {
                    name: "stake",
                    text: stakeText,
                    type: "stake",
                    enabled: 0,
                    valueText: "0",
                    value: 0
                }
            ]);
	    }

        function gameControlChanged(value) {
            msgBus.publish("jLotteryGame.onGameControlChanged", {
                name: "stake",
                event: "change",
                params: [SKBeInstant.formatCurrency(value).amount / 100, SKBeInstant.formatCurrency(value).formattedAmount]
            });
            msgBus.publish("jLotteryGame.onGameControlChanged", {
                name: "price",
                event: "change",
                params: [value, SKBeInstant.formatCurrency(value).formattedAmount]
            });
        }

        function onConsoleControlChanged(data) {
            if (data.option === "price") {               
                if(data.value){
                    setTicketCostValue(Number(data.value));
                    msgBus.publish("jLotteryGame.onGameControlChanged", {
                        name: "stake",
                        event: "change",
                        params: [SKBeInstant.formatCurrency(data.value).amount / 100, SKBeInstant.formatCurrency(data.value).formattedAmount]
                    });
                }
            }        
        }

        function enableConsole() {
            msgBus.publish("toPlatform", {
                channel: "Game",
                topic: "Game.Control",
                data: { name: "price", event: "enable", params: [1] }
            });
        }
        function disableConsole() {
            msgBus.publish("toPlatform", {
                channel: "Game",
                topic: "Game.Control",
                data: { name: "price", event: "enable", params: [0] }
            });
        }

        function onGameParametersUpdated(){
            for (var i = 0; i < config.gameConfigurationDetails.revealConfigurations.length; i++) {
                var price = config.gameConfigurationDetails.revealConfigurations[i].price;
                prizePointList.push(price);
                ticketIcon[price] = '_ticketCostLevelIcon_' + i;
                gr["_ticketCostLevelIcon_" + i].$backgroundImage.gotoAndPlay('ticketCostLevelIconOff');           
            }   
            gr._ticketCost.visible = true;        
            if(prizePointList.length <= 1){
                gr._ticketCostPlus.visible = false;
                gr._ticketCostMinus.visible = false;
                for(i = 0; i < ticketPrice; i++){
                    gr["_ticketCostLevelIcon_" + i].visible = false;    
                }      
            }else{
                gr._ticketCostPlus.visible = true;
                gr._ticketCostMinus.visible = true;
                for(i = 0; i < ticketPrice;i++){
                    if(i < prizePointList.length){
                        gr["_ticketCostLevelIcon_" + i].visible = true;
                    }else{
                        gr["_ticketCostLevelIcon_" + i].visible =false;
                    }
                }
                gameUtil.fixTicketSelect(gr , prizePointList , ticketPrice);
                gr._ticketCostPlus.on('click', increaseTicketCost);
                gr._ticketCostMinus.on('click', decreaseTicketCost);
            }
            setTicketCostValue(config.gameConfigurationDetails.pricePointGameDefault);      
            registerControl();
            setDefaultPricePoint();
        }

        function setDefaultPricePoint(){
            setTicketCostValueWithNotify(config.gameConfigurationDetails.pricePointGameDefault);
        }

        function setTicketCostValue(prizePoint) {
            var index = prizePointList.indexOf(prizePoint);
            if (index < 0) {
                //throw new Error('Invalide prize point ' + prizePoint);
                return;
            }
            if (index === 0) {
                gr._ticketCostMinus.$backgroundImage.gotoAndPlay('ticketCostMinusInactive');
            } else {
                gr._ticketCostMinus.$backgroundImage.gotoAndPlay('ticketCostMinus');
            }
            if (index === (prizePointList.length - 1)) {
                gr._ticketCostPlus.$backgroundImage.gotoAndPlay('ticketCostPlusInactive');
            } else {
                gr._ticketCostPlus.$backgroundImage.gotoAndPlay('ticketCostPlus');
            }

            gr._ticketCostValue.$text.text = config.wagerType==='BUY'?SKBeInstant.formatCurrency(prizePoint).formattedAmount:resLib.i18n.game.demo+' ' +SKBeInstant.formatCurrency(prizePoint).formattedAmount;
            _currentPrizePoint = prizePoint;
            if(ticketIconObj){
                ticketIconObj.$backgroundImage.gotoAndPlay('ticketCostLevelIconOff');
            }
            ticketIconObj = gr[ticketIcon[prizePoint]];
            ticketIconObj.$backgroundImage.gotoAndPlay('ticketCostLevelIconOn');
            gameUtil.fixMeter(gr);
            msgBus.publish('ticketCostChanged', prizePoint);
        }
        
        function increaseTicketCost() {
            var index = prizePointList.indexOf(_currentPrizePoint);
            index++;
            setTicketCostValueWithNotify(prizePointList[index]);	       
            audio.play('ButtonGeneric', 0);
        }

        function setTicketCostValueWithNotify(prizePoint) {
            setTicketCostValue(prizePoint);
            if(prizePoint){
                gameControlChanged(prizePoint);
            }
        }

        function decreaseTicketCost() {
            var index = prizePointList.indexOf(_currentPrizePoint);
            index--;
            setTicketCostValueWithNotify(prizePointList[index]);	 
            audio.play('ButtonGeneric', 0);
        }


        function onInitialize() {      
            enableConsole();
        }

        function onReInitialize() {
           setTicketCostValueWithNotify(config.gameConfigurationDetails.pricePointGameDefault); 
           onInitialize();         
         }

        function onStartUserInteraction(data) {
            disableConsole();
            gr._ticketCost.visible = false;
            if (data.scenario) {
                _currentPrizePoint = data.price||_currentPrizePoint;
                gr._ticketCostValue.$text.text = config.wagerType==='BUY'?SKBeInstant.formatCurrency(_currentPrizePoint).formattedAmount:resLib.i18n.game.demo+' ' +SKBeInstant.formatCurrency(_currentPrizePoint).formattedAmount;
                gr._buttonAutoPlay.visible = true;
                gr._buttonAutoPlayMTM.visible = true;
            } else {
                gr._buttonAutoPlay.visible = false;
                gr._buttonAutoPlayMTM.visible = false;
            }
            setTicketCostValueWithNotify(_currentPrizePoint);
            msgBus.publish('ticketCostChanged', _currentPrizePoint);
        }

        function onReStartUserInteraction(data) {
            onStartUserInteraction(data);
        }
        
        function showMeterDim(){
            gr._ticketCost.visible = true;
        }
        
        // function onGameControlChanged(data) {
		// 	if (data.option === 'stake') {
		// 		setTicketCostValue(Number(data.value));
		// 	}
		// }
		
		function onreset() {
			onReInitialize();
            gr._ticketCost.visible = true;
		}
        
        function onOpenTutorial(){
            if(gr._ticketCost.visible){
                gr._ticketCost.alpha = 0;
            }
        }
        
        function onCloseTutorial(){
            gr._ticketCost.alpha = 1;
        }
        
        function onPlayerBuyOrTry(){
            gr._ticketCost.visible = false;        
        }       

        msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
        msgBus.subscribe('playerBuyOrTry', onPlayerBuyOrTry);
        msgBus.subscribe('jLottery.initialize', onInitialize);
        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe('jLotterySKB.reset', onreset);
        //msgBus.subscribe('onGameControlChanged', onGameControlChanged);
        msgBus.subscribe('playAgain', showMeterDim);
        msgBus.subscribe('openTutorial', onOpenTutorial);
        msgBus.subscribe('closeTutorial', onCloseTutorial);
        msgBus.subscribe("jLotterySKB.onConsoleControlChanged", onConsoleControlChanged);
        msgBus.subscribe("SKBeInstant.gameParametersUpdated", onGameParametersUpdated);
        return {};
    };
});