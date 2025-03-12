define([
	'com/createjs/easeljs',
	'game/util/GladRenderer',
	'skbJet/component/gameMsgBus/GameMsgBus',
	'game/audio',
	'game/meters',
	'game/resultDialog',
	'game/playAnimation',
	'game/revealAllAndStopButton',
	'game/buyAndTryButton',
	'game/ticketCost',
	'game/playWithMoney',
	'game/exitButton',
	"game/paytable",
	"game/tutorialController",
	"game/playAgainController",
	"game/gameUtil",
	'skbJet/component/SKBeInstant/SKBeInstant',
	'game/loading',
	'game/jLotteryInnerLoarderUIController',
	'skbJet/component/resourceLoader/resourceLib'
	], function(
		cjs,
		GladRenderer, 
		gameMsgBus, 
		audio, 
		meters, 
		resultDialog, 
		playAnimation, 
		revealAllAndStopButton, 
		buyAndTryButton, 
		ticketCost, 
		playWithMoney, 
		exitButton, 
		paytable, 
		tutorialController, 
		playAgainController, 
		gameUtil, 
		SKBeInstant,
		loading,
		jLotteryInnerLoarderUIController,
		resLib
		) {
	    loading();
		cjs=window.createjs;

		var jLottery = {
			playerWantsToMoveToMoneyGame:function(){
				gameMsgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
			},
			playerWantsToPlay:function(price, spots){
				gameMsgBus.publish('jLotteryGame.playerWantsToPlay', {price:price, spots:spots});
			},
			playerWantsToRePlay:function(price, spots){
				gameMsgBus.publish('jLotteryGame.playerWantsToRePlay', {price:price, spots:spots});
			},
			ticketResultHasBeenSeen:function(tierPrizeShown, amountWonShown){
				gameMsgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
					tierPrizeShown         : tierPrizeShown,
					formattedAmountWonShown: SKBeInstant.formatCurrency(amountWonShown).formattedAmount
				});
			},
			playerWantsToExit:function(){
				gameMsgBus.publish('jLotteryGame.playerWantsToExit');
			},
			revealDataSave:function(data){
				gameMsgBus.publish('jLotteryGame.revealDataSave', data);
			},
			error:function(data){
				gameMsgBus.publish('jLotteryGame.error', data);
			},
			formatCurrency:SKBeInstant.formatCurrency
		};

		function init(config, spriteSheets) {
			var canvas = document.createElement('canvas');
			canvas.id = 'gameCanvas';
			SKBeInstant.getGameContainerElem().appendChild(canvas);
			var stage = new cjs.Stage('gameCanvas');
			var orientation = SKBeInstant.getGameOrientation();
			var gr;
			cjs.Touch.enable(stage);
			if(orientation !== "landscape") {
				config.gameConfigurationDetails.orientation = 'portrait';
				gr = GladRenderer(window._gladPortrait, spriteSheets, stage);
			} else if(canvas.width > canvas.height) {
				config.gameConfigurationDetails.orientation = 'landscape';
				gr = GladRenderer(window._gladLandscape, spriteSheets, stage);						
			}
			
        	//window.gr =gr;
			gameMsgBus.subscribe('jLottery.updateBalance',function(data){
				gr._balanceValue.$text.text = data.formattedBalance;
				gameUtil.fixMeter(gr);
			});
			//show game scene
			gr._GameScene.visible = true;
			canvas.parentElement.style.backgroundImage = 'url({0})'.replace(/\{0\}/, resLib.images[gr._GameScene.$background].src);
			canvas.parentElement.style.backgroundRepeat = 'no-repeat';
			canvas.parentElement.style.backgroundSize = 'cover';	
			canvas.parentElement.style.backgroundPosition = 'center';
        	//init controls
			if(gr._winBoxError){
				gr._winBoxError.visible = false;
			}

			audio(gr, config);
			meters(gr,config);
			resultDialog(gr,config, jLottery);
			playAnimation(gr, config, stage, orientation);
			revealAllAndStopButton(gr,config);
			buyAndTryButton(gr, config,jLottery);
			ticketCost(gr, config,jLottery);
			playWithMoney(gr, config, jLottery);
			exitButton(gr, config, jLottery);
			paytable();
			//paytable(gr,config,jLottery);
			tutorialController(gr, config, orientation);
			playAgainController(gr,config);
			jLotteryInnerLoarderUIController();
			
		    var inGame = false;
			var showWarn = false;
			var warnMessage = null;
			var showError = false;
			function warn(warning){	 
				warnPageShow(true);        				
				gr._warningExitText.$text.text=resLib.i18n.game.warning_button_exitGame;
				gr._warningContinueText.$text.text=resLib.i18n.game.warning_button_continue;
				gr._warningTitle.$text.text=resLib.i18n.game.warning_title;
				gr._warningText.$text.text=warning.warningMessage;
				gr._warningText.$text.lineHeight = 40;
				gr._warningContinueButton.on('click', closeErrorWarn);
				gr._warningExitButton.on('click',function(){jLottery.playerWantsToExit();audio.play('ButtonGeneric',0);});
			}

			function closeErrorWarn(){
				showError = false;
				gr._GameScene.visible = true;
				gr._ErrorScene.visible = false;
				audio.play('ButtonGeneric',0);
			}

			function error(error){
				showError = true;
				 if (error.errorCode === '29000') {
					if (gr._winBoxError) {
						gr._winBoxError.visible = true;
						gr._winBoxErrorText.$text.text = error.errorCode;
					}					
				} else {
					warnPageShow(false);
					gr._errorExitText.$text.text = resLib.i18n.game.error_button_exit;
					gr._warningTitle.$text.text=resLib.i18n.game.error_title;
					gr._warningText.$text.text=error.errorCode + ":" + error.errorDescriptionSpecific + "\n" + error.errorDescriptionGeneric;
					gr._warningText.$text.lineHeight = 40;   
				}		
				gr._errorExitButton.on('click', function(){
                    jLottery.playerWantsToExit();
                    audio.play('ButtonGeneric',0);
                });
			}

			function warnPageShow(flag){
				gr._GameScene.visible = false;			
				gr._ErrorScene.visible = true;
				gr._warningExitButton.visible = flag;
				gr._warningContinueButton.visible = flag;
				gr._errorExitButton.visible = !flag;
			}

			function onEnterResultScreenState(){
				inGame = false;
				if (showWarn) {
					showWarn = false;
					setTimeout(function () {
						warn(warnMessage);
					}, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
				}
			}

			gameMsgBus.subscribe('jLottery.reInitialize', function(){
				inGame = false;
			});
			gameMsgBus.subscribe('jLottery.reStartUserInteraction', function(){
				inGame = true;
			});
			gameMsgBus.subscribe('jLottery.startUserInteraction', function(){
				inGame = true;
			});
			gameMsgBus.subscribe('buyOrTryHaveClicked', function(){
				inGame = true;
			});
			gameMsgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
			gameMsgBus.subscribe('jLottery.error', error);
			gameMsgBus.subscribe('jLottery.playingSessionTimeoutWarning', function(warning){
				 if(SKBeInstant.config.jLotteryPhase === 1 || showError){
					return;
				}
				if(inGame){
					warnMessage = warning;
					showWarn = true;
				}else{
					warn(warning);                
				}
			});
		}
		return {
			init:init
		};
	
});
