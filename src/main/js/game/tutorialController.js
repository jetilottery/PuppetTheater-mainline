define([
    'skbJet/component/gameMsgBus/GameMsgBus', 
    'skbJet/component/resourceLoader/resourceLib',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'com/createjs/easeljs', 
    'com/createjs/tweenjs', 
    'game/audio'], function (msgBus,resLib,SKBeInstant) {
    return function(gr, config, orientation){
        var tutorialFlag = false; 
        var reFlag = false;
        var mtmJFlag = false;
        var showTutorialAtBeginning = true;
             
        function onInitialize(){
            if(showTutorialAtBeginning){
                showTutorialonInitial();
            }else{
                msgBus.publish('closeTutorial');
            }
        }

        function showTutorialonInitial(){
            gr._tutorial.visible = true;
            gr._tutorial_BG_dim.visible = true;
            gr._buttonInfo.visible = false;
            msgBus.publish('openTutorial');
        }

        function onStartUserInteraction(){
            gr._tutorial.visible = false;
            gr._tutorial_BG_dim.visible = false;   
            tutorialFlag = true;        
            gr._buttonInfo.visible = true;
            if(config.gameType === 'ticketReady'){
                if(showTutorialAtBeginning){
                    showTutorialonInitial();
                }else{
                    msgBus.publish('closeTutorial');
                }
            }
        }
        
        function showOrHideTutorial(){
            if(tutorialFlag){
                if(gr.animMap._tutorialDisappearAnim.isPlaying){
                    return;
				}
                tutorialFlag = false;
                gr._tutorial.visible = true;
                gr._tutorial_BG_dim.visible = true;
                gr.animMap._tutorialShowAnim.play();
                gr._buttonInfo.visible = false;
                msgBus.publish('openTutorial');
            } else{
                if(gr.animMap._tutorialShowAnim.isPlaying){
                    return;
                }
                tutorialFlag = true;
                gr.animMap._tutorialDisappearAnim._onComplete = function(){
                    gr._tutorial.visible = false;
                };
                gr.animMap._tutorialDisappearAnim.play();
                gr._tutorial_BG_dim.visible = false;
                gr._buttonInfo.visible = true;
                msgBus.publish('closeTutorial');
            }
        }

        function init(){
            gr._versionText.$text.text = window._cacheFlag.gameVersion;
            gr._tutorialTitleText.$text.text = resLib.i18n.game.gamePlay;
            gr._buttonCloseText.$text.text = resLib.i18n.game.button_Close;
            if(orientation === "landscape") {
                gr._tutorialPage_00_Text_00.$text.text = resLib.i18n.game.help_text_landscape;
            } else {
                gr._tutorialPage_00_Text_00.$text.text = resLib.i18n.game.help_text_portrait;
                gr._tutorialPage_00_Text_00.$text.lineHeight = 40;
            }
            gr._buttonCloseTutorial.on('click', showOrHideTutorial);
            gr._buttonInfo.on('click', showOrHideTutorial);
            onTicketCostChanged(config.defaultWinsValue);
            if(SKBeInstant.config.customBehavior){
                if(SKBeInstant.config.customBehavior.showTutorialAtBeginning === false){
                    showTutorialAtBeginning = false;
                    gr._buttonInfo.visible = true;
                    gr._tutorial_BG_dim.visible = false;
                    gr._tutorial.visible = false;
                }
            }
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
                    gr._winUpToText.$text.text = resLib.i18n.game.ui_winUpToAmount + ' ' + SKBeInstant.formatCurrency(maxPrize).formattedAmount + '!';
                }
            }

        }
        
        function onReInitialize(){
            tutorialFlag = true;
            if(reFlag){               
                reFlag = false;
                if(showTutorialAtBeginning){
                    showOrHideTutorial();
                }else{
                    msgBus.publish('closeTutorial');
                }
            }else{
                gr._buttonInfo.visible = true;
            }    
        }
        
        function onDisableUI(){
            gr._buttonInfo.visible = false;
        }
        
        function onEnableUI(){
            gr._buttonInfo.visible = true;
        }
        
        function onReStartUserInteraction(){
            gr._tutorial.visible = false;
            gr._tutorial_BG_dim.visible = false;   
            tutorialFlag = true;
            gr._buttonInfo.visible = true;
        }
        
        function onStopRevealAll(){
            gr._buttonInfo.visible = true;
        }

        function onPlayerWantsToMoveToMoney(){
            mtmJFlag = true;
            reFlag = true;
        }

        function onEnterResultScreenState(){
            setTimeout(function () {
                gr._buttonInfo.visible = true;
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
        }
                   
        init();
        msgBus.subscribe('jLottery.initialize', onInitialize);
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoney);
        msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
        msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
        msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe('enableUI', onEnableUI);
        msgBus.subscribe('disableUI', onDisableUI);
        msgBus.subscribe('stopRevealAll', onStopRevealAll);
        msgBus.subscribe('bonus',onDisableUI);
        return {};
    };
});