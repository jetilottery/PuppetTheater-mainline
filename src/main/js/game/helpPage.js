/**
 * @module game/helpPage
 * @description helpPage control
 */
define(['game/audio', 'skbJet/component/gameMsgBus/GameMsgBus', 'skbJet/component/resourceLoader/resourceLib', 'skbJet/component/SKBeInstant/SKBeInstant'], function(audio,msgBus, template){
    
   // var template = require('lodash/template'); 
    
    return function (gr, store, resources, strings) {
           var background = template('url(<%= uri %>) center / cover no-repeat');
        var config = store.local('config');
        function openHelp() {
            gr._GameScene.visible = false;
            gr._HelpScene.visible = true;

            if (store.local('orientation') === 1){
                gr._buttonHelp.stage.canvas.parentElement.style.background = background({uri: resources.images.landscapeHelpBG.src});
            }else{
                gr._buttonHelp.stage.canvas.parentElement.style.background = background({uri: resources.images.portraitHelpBG.src});
            }

            audio.play('ButtonGeneric', 0);
        }

        function closeHelp() {
            gr._GameScene.visible = true;
            gr._HelpScene.visible = false;

            if (store.local('orientation') === 1){
                gr._buttonHelp.stage.canvas.parentElement.style.background = background({uri: resources.images.landscapeBG.src});
            }else{
                gr._buttonHelp.stage.canvas.parentElement.style.background = background({uri: resources.images.portraitBG.src});
            }

            audio.play('ButtonGeneric', 0);
        }

        function onTicketCostChanged(prizePoint) {
            var rc = config.gameConfigurationDetails.revealConfigurations;
            for (var i = 0; i < rc.length; i++) {
                if (Number(prizePoint) === Number(rc[i].price)) {
                    var ps = rc[i].prizeStructure;
                    var maxPrize = 0;
                    for (var j = 0; j < ps.length; j++) {
                        var prize = Number(ps[j].prize);
                        if (maxPrize < prize) {
                            maxPrize = prize;
                        }
                    }
                    gr._WinUpToText.$text.text = strings.ui_winUpToAmount + ' ' + store.currency.format(maxPrize) + '!';
                    return;
                }
            }

        }
        gr._buttonHelp.on('click', openHelp);
        gr._HelpBG.on('click', closeHelp);
        //gr._buttonCloseHelp.on('click', closeHelp);
        gr._HelpScene.visible = false;
        gr._HowToPlayTitle.$text.text = strings.PrizeXBonus;
        if (gr._HelpScene.stage.canvas.width > gr._HelpScene.stage.canvas.height) {
            gr._GameRules.$text.text = strings.help_text_landscape;
        } else {
            gr._GameRules.$text.text = strings.help_text_portrait;
        }
        gr._GameRules.$text.lineHeight = 40;
        gr._GameRules.$text.textAlign='left';
        if(store.local('orientation') === 1){
            if(config.locale === 'zh_cn'){
                gr._GameRules.$text.x=50; 
            }else{
                gr._GameRules.$text.x=-5;          
            }
        } else{         
            if(config.locale === 'en_us'){
                gr._GameRules.$text.x=-5;
            }else{
                gr._GameRules.$text.x=30;
            }
        }
        // var totalWith = gr._HowToPlayTitle.$text.getMeasuredWidth();
        gr._HowToPlayTitle.$text.x = gr._HowToPlayTitle.regX;
        gr._helpBalanceText.$text.text = strings.balance;

        function onDisableUI() {
            gr._buttonHelp.visible = false;
        }

        function onEnableUI() {
            gr._buttonHelp.visible = true;
        }
        
        /*function onBonus(){
            gr._buttonHelp.visible = false;
        }*/
        function onReInitialize(){
            gr._buttonHelp.visible = true;
        }
        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe('disableUI', onDisableUI);
        msgBus.subscribe('enableUI', onEnableUI);
        msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
       // msgBus.subscribe('bonus',onBonus);
    };
});
