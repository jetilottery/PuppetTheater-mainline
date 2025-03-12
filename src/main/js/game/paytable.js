/**
 * @module paytableHelpController
 * @description
 */
define([
		'skbJet/component/gameMsgBus/GameMsgBus',
        'skbJet/component/resourceLoader/resourceLib',
		'game/audio',
        'skbJet/component/SKBeInstant/SKBeInstant'
	], function(msgBus, loader, audio, SKBeInstant){
    return function (){
    var paytableText, howToPlayText;
    function onSystemInit(){
        var articles=document.getElementsByTagName('article');
        for(var i=0;i<articles.length;i++){
            articles[i].addEventListener('mousedown',preventDefault,false);
        }
        document.addEventListener('mousemove',preventDefault,false);
	}

    function preventDefault(e){
        var ev=e||window.event;
        ev.returnValue=false;
        ev.preventDefault();
    }

    function onGameInit(){
        registerConsole();   
    }

    function onBeforeShowStage(){        
        fillHeaders();
        fillContent();
        fillCloseBtn();
        titleGo();
    }

    function onStartUserInteraction(){
        disableConsole();       
    }
    
    function onReStartUserInteraction(){
        disableConsole();        
    }
    
    function onReInitialize(){
         enableConsole();  
    }

    function registerConsole(){
        if(SKBeInstant.isWLA()){
            paytableText = loader.i18n.game.MenuCommand.WLA.payTable;
            howToPlayText = loader.i18n.game.MenuCommand.WLA.howToPlay;
        }else{
            paytableText = loader.i18n.game.MenuCommand.Commercial.payTable;
            howToPlayText = loader.i18n.game.MenuCommand.Commercial.howToPlay;
        }
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                options:[{
                    type:'command',
                    name:'paytable',
                    text:paytableText,
                    enabled:1
                }]
            }
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                options:[{
                    type:'command',
                    name:'howToPlay',
                    text:howToPlayText,
                    enabled:1
                }]
            }
        });
    }

    function enableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"howToPlay","event":"enable","params":[1]}
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"paytable","event":"enable","params":[1]}
        });
    }  
    
    function disableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"howToPlay","event":"enable","params":[0]}
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"paytable","event":"enable","params":[0]}
        });
    }
    function titleGo() {
        var li = document.getElementsByTagName("li");
        var gameRulesSection = document.getElementsByTagName("section")[0];
        var howToPlay = document.getElementById("howToPlay");
        var autoReveal = document.getElementById("autoPlayOrStop");
        var aboutTheGame = document.getElementById("aboutTheGame");
        var rules = document.getElementById("rules");
        var topBack = document.getElementsByTagName("b");
        var gameRulesTitle = [howToPlay,autoReveal,aboutTheGame,rules];
		var index;
		function gameRulsTitle(index){
			return function(){
				gameRulesSection.scrollTop = gameRulesTitle[index].offsetTop - gameRulesTitle[index].offsetHeight*4;
			};
		}
		function topBackUp(){
			return function(){
				gameRulesSection.scrollTop = 0;
			};
		}
        for (var i = 0; i < li.length; i++) {
            index = i;
			li[index].onclick = gameRulsTitle(index);
        }
        for (i = 0; i < topBack.length; i++) {
            index = i;         
			topBack[index].onclick = topBackUp();
        }
    }
    function fillHeaders(){
        var gameRulesHeader = document.getElementById('gameRulesHeader');
        var payTableHeader = document.getElementById('paytableHeader');
        gameRulesHeader.innerHTML = howToPlayText;
        //gameRulesHeader.innerHTML = loader.i18n.helpHTML;
        payTableHeader.innerHTML = paytableText;
    }

    function fillContent(){
        //fill paytable
        var paytableText = loader.i18n.paytable.replace(/\"/g,"'");
        var tHead = '<th>PRIZE LEVEL</th>';
        var tBody = '';
        
        var revealConfigurations = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        var availablePrices = SKBeInstant.config.gameConfigurationDetails.availablePrices;
        var i, j;
        for(i=0; i< availablePrices.length; i++){
            tHead += '<th>' + SKBeInstant.formatCurrency(availablePrices[i]).formattedAmount + '</th>';
        }
        paytableText = paytableText.replace('{paytableHead}',tHead);
        
        for(i=0; i< revealConfigurations[0].prizeTable.length; i++){       
            tBody += '<tr>';
            tBody += '<td>' + (i+1) + '</td>';
            for(j=0; j< availablePrices.length; j++){
                tBody += '<td>' + SKBeInstant.formatCurrency(revealConfigurations[j].prizeTable[i].prize).formattedAmount + '</td>';                
            }
            tBody += '</tr>';            
        }
        
        paytableText = paytableText.replace('{paytableBody}',tBody);
        
        var paytableBox = document.getElementById('paytableArticle');
        paytableBox.innerHTML = paytableText;
        
        var howToPlayText = loader.i18n.help.replace(/\"/g,"'");
        var howToPlayBox = document.getElementById('gameRulesArticle');
        howToPlayBox.innerHTML = howToPlayText;
    }

    function fillCloseBtn(){
        var buttons=document.getElementsByClassName('closeBtn');
        Array.prototype.forEach.call(buttons,function(item){
            item.innerHTML = loader.i18n.game.buttonClose;
            item.onclick=function(){showOne('game');};
        });
    }

    function showOne(id){
        var tabs=document.getElementsByClassName('tab');
        for(var i=0;i<tabs.length;i++){
            tabs[i].style.display='none';
        }
        document.getElementById(id).style.display='block';
    }

    //retrigger clickbtn
    function onGameControl(data){
        if(data.option==='paytable'||data.option==='howToPlay'){
            var id = data.option==='howToPlay'? 'gameRules' : 'paytable';
            if(document.getElementById(id).style.display==='block'){
                showOne('game');
            }else{
                showOne(id);
            }
        }
    }

    function onAbortNextStage(){
        disableConsole();
    }

    function onResetNextStage(){
        enableConsole();
    }
    
    function onEnterResultScreenState(){
        enableConsole();
    }
    
 	msgBus.subscribe('platformMsg/Kernel/System.Init', onSystemInit);
    msgBus.subscribe('platformMsg/ClientService/Game.Init', onGameInit);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('onAbortNextStage', onAbortNextStage);
    msgBus.subscribe('onResetNextStage', onResetNextStage);
    msgBus.subscribe('platformMsg/ConsoleService/Game.Control', onGameControl);
       
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	return {};
    };
});

