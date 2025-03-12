/**
 * @module game/meters
 * @description meters control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus', 
    'skbJet/component/resourceLoader/resourceLib',
    "game/gameUtil",
    "skbJet/component/SKBeInstant/SKBeInstant",
    "skbJet/component/currencyHelper/currencyHelper"
    ], function (msgBus,resLib,gameUtil, SKBeInstant, currencyHelper) {
    return function (gr,config) {
        var resultData = null;
        var MTMReinitial = false;
        
        function onGameParametersUpdated() {
            if(SKBeInstant.config.balanceDisplayInGame === false || (SKBeInstant.config.wagerType === 'TRY' && (!SKBeInstant.isSKB() || Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1))){
                gr._balanceValue.visible = false;
                gr._balanceText.visible = false;
                gr._division_0.visible = false;
            }
            gr._balanceText.$text.text = resLib.i18n.game.balance;
            gr._ticketCostMeterText.$text.text = resLib.i18n.game.ticketCost_meter;
            gr._division_0.$text.text = resLib.i18n.game.divisionText;
            gr._division_1.$text.text = resLib.i18n.game.divisionText;
            gr._balanceValue.$text.text = "";
            if (config.wagerType === 'BUY') {
                gr._winsText.$text.text = resLib.i18n.game.wins;
            } else {
                gr._winsText.$text.text = resLib.i18n.game.wins_demo;
            }
            gameUtil.fixMeter(gr);
            if(config.locale === 'en_us'){
                gr._logo.$backgroundImage.gotoAndPlay('logo_en');
            }else{
                gr._logo.$backgroundImage.gotoAndPlay('logo');
            }
        }

        function onBeforeShowStage(data){
            gr._balanceValue.$text.text = currencyHelper.formatBalance(data.response.Balances["@totalBalance"]);   
            gameUtil.fixMeter(gr);
        }      

        function onStartUserInteraction(data) {          
            resultData = data;          
        }

        function onEnterResultScreenState() {          
            if(resultData.prizeValue > 0 || SKBeInstant.isWLA()){
                gr._winsValue.$text.text = SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount;
                gameUtil.fixMeter(gr);    
            }          
        }

        function onReStartUserInteraction(data) {         
            onStartUserInteraction(data);
        }

        function onReInitialize() {
            if (MTMReinitial && SKBeInstant.config.balanceDisplayInGame) {
                gr._balanceText.visible = true;
                gr._balanceValue.visible = true;
                gr._division_0.visible = true;
            }
            gr._winsValue.$text.text = SKBeInstant.config.defaultWinsValue;        
            gr._winsText.$text.text = resLib.i18n.game.wins;
            gameUtil.fixMeter(gr);   
        }

        function onUpdateBalance(data){
            if (SKBeInstant.config.balanceDisplayInGame) {
                gr._balanceValue.$text.text = data.formattedBalance;
                gameUtil.fixMeter(gr);
            }
        }
        
        function onTicketCostChanged(){
            gr._ticketCostMeterValue.$text.text = gr._ticketCostValue.$text.text;
            gameUtil.fixMeter(gr);
        }

        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe("onBeforeShowStage", onBeforeShowStage);
        msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
        msgBus.subscribe('jLottery.updateBalance', onUpdateBalance);
        msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
        msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
        msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',function(){
            MTMReinitial = true;
        });
        msgBus.subscribe('jLotteryGame.error', function(){
            gr._winsValue.$text.text = SKBeInstant.config.defaultWinsValue;
            gameUtil.fixMeter(gr);
        });
        return {};
    };
});