/**
 * @module game/ticketCostMeter
 * @description ticket cost meter control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus', 
    'game/audio',
    'com/createjs/easeljs',
    'skbJet/component/resourceLoader/resourceLib',
    'skbJet/component/SKBeInstant/SKBeInstant'
    //"game/gameUtil"
], function(msgBus, audio, cjs,resLib, SKBeInstant) {
    return function (gr, config, stage, orientation) {
        var cjs=window.createjs;
        var count;
        var revealAll=false;       
        var baseScene;
        var bonusScene;
        var result;
        var baseSymbolListener=[];
        var mask=[];
        var container;
        var containerBonus;
        var maskBonus=[];
        var clearBaseSymbolListenerFlag;
        var clickedAnimal;
        var bonusFlag;
        var bonusCount;
        var bonusVertify;
        var animalNameArray;
        var animalsRandomSymbolArray;
        var symbolsPositionArray;
        var symbolsNumberSelectArray;    
        var time;
        var tweenArray;
        var countTimer=0;     
        var baseSymbolIndex =  {"5":[2,3],"3":[5,6], "1":[8,9],"0":[11,12],"2":[14,15],"4":[17,18]};
        var order=[];
        var bonusStart;
        var dataResult;
        var prizeUpdate;
        var listenerForTimer=[];
        var prizeValueSum = 0;

		function resetAll(){
            clearTimer();
            prizeUpdate=0;
            bonusFlag=false;
            bonusVertify=0;
            bonusCount=0;
            count=0;
            time=0;
            countTimer=0;
            result=[];
            tweenArray=[];
            animalNameArray=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
            animalsRandomSymbolArray=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];                   
            gr._dropBoard.visible=false;          
            gr._Mask.visible=false;
            gr._bonusSymbol.visible=false;
            gr._Hands.visible=false;
            gr._Hands.y=45;
            symbolsNumberSelectArray=[];
            bonusStart=false;
            createSymbolsArray(symbolsNumberSelectArray);                
            if(orientation === "landscape"){
                for(var i=0;i<8;i++){
                    gr['_hand0'+i].y=755;
                }
            }else{
                for(var i=0;i<8;i++){
                    gr['_hand0'+i].y=890;
                }
            }
            changeHands();            
            revealAll=false;
            clearBaseSymbolListenerFlag=false;
            addMaskForAnimals();
            resetAnimal();           
            addMaskForBonusAnimals();		   
            for(var i=0;i<baseSymbolListener.length;i++){
                clearTimeout(baseSymbolListener[i]);   
            }
            resetBonusAnimals();  
            clearAnimalsListenerForBonus();        
           for(var i=0; i<animalNameArray.length;i++){
               var animal=gr['_animal'+animalNameArray[i]];
               animal.childIndex=gr._baseSymbol.children.indexOf(animal);
           }          
           if(gr._light01){
               gr._light01.$backgroundImage.gotoAndStop('bonusLight');          
           }
           gr._light.$backgroundImage.gotoAndStop('bonusLight');    
		}
        
        function changeHands(){
            if(config.wagerType === 'BUY' && gr._Hand0){
                gr._Hand0.x = 599;
                gr._Hand1.x = 99;
            }           
            if(config.wagerType === 'TRY' && gr._Hand0){
                gr._Hand0.x = 714;
                gr._Hand1.x = -20;
            }
        }
        
        function textSizeChange(winSym, text) {
            if(text.length < 6){
                winSym.$text.font = "600 30px Arial";
            } else if(text.length<10){
                winSym.$text.font = "600 24px Arial";
            }else{
                winSym.$text.font = "600 18px Arial";
            }
        }

        function clearTimer(){
            for(var i=0;i<listenerForTimer;i++){
               clearTimeout(listenerForTimer[i]);
           }
        }
        
        function resetBonusAnimals(){
            for(var i=0;i<animalNameArray.length;i++){             
                for(var j=0;j<4;j++){
                    var bonusAnimal=gr['_bonusAnimal'+animalNameArray[i]+'0'+j];
                    bonusAnimal.$backgroundImage.currentAnimationFrame=0;
                    bonusAnimal.$backgroundImage.gotoAndStop('symbol'+animalNameArray[i]);
                    bonusAnimal.revealFlag=false;
                    if(orientation === "landscape"){
                        bonusAnimal.y=450;
                    }
                    else{
                        if(j===0||j===1){
                            bonusAnimal.y=518;
                        }else{
                            bonusAnimal.y=730;                        
                        }
                    }
                    bonusAnimal.alpha=1;
                    bonusAnimal.visible=false;
                    if(bonusAnimal.clickListener){
                        bonusAnimal.off('click',bonusAnimal.clickListener);
                    }
                }              
            }
        }

        function downAnimals(){
            for(var i=0;i<animalNameArray.length;i++){
                var name=animalNameArray[i];
                var animal=gr['_animal'+name];      
                if(animal.visible&&animal.coordinateY){
                    cjs.Tween.get(animal,{loop:false}).to({y:animal.coordinateY},300).call(function(){
                        this.visible=false;
                    });
                }
            }
        }

        function addListenerForScreen(screenName,screenNameBack){
            gr._screenLeft.$backgroundImage.on('animationend',function(){
                if(gr._screenLeft.$backgroundImage.currentAnimation===screenName) {
                    gr._screenLeft.$backgroundImage.gotoAndPlay(screenNameBack);
                    gr._screenRight.$backgroundImage.gotoAndPlay(screenNameBack);
                }
            },null,false);
            gr._screenRight.$backgroundImage.on('animationend',function(){
                if(gr._screenRight.$backgroundImage.currentAnimation===screenName&&bonusStart){
                    gr._bonusSymbol.visible=true;
                    gr._baseSymbol.visible=false; 
                    if(gr._light01){
                        gr._light01.$backgroundImage.gotoAndPlay('bonusLight');          
                    }
                    gr._light.$backgroundImage.gotoAndPlay('bonusLight'); 
                }
                if(gr._screenRight.$backgroundImage.currentAnimation===screenNameBack&&bonusStart){
                    bonusAnimalUp();
                }
                if(gr._screenRight.$backgroundImage.currentAnimation===screenName&&!bonusStart){
                    gr._bonusSymbol.visible=false;
                    gr._baseSymbol.visible=true;
                    clearBaseSymbolListenerFlag=false; 
                }
                if(gr._screenRight.$backgroundImage.currentAnimation===screenNameBack&&!bonusStart){
                    baseGameStartAfterBonus();                        
                }
            },null,false);    
        }

        function screenAnimation(){
            if(orientation === "landscape") {
                gr._screenLeft.$backgroundImage.gotoAndPlay('screen');
                gr._screenRight.$backgroundImage.gotoAndPlay('screen');
            } else{
                gr._screenLeft.$backgroundImage.gotoAndPlay('portraitScreen');
                gr._screenRight.$backgroundImage.gotoAndPlay('portraitScreen');
            }                
            audio.play('Transition',0);      
        }
        
        function clearBaseSymbolListener(){
            clearBaseSymbolListenerFlag=true;
            for(var i=0;i<baseSymbolListener.length;i++){
                clearTimeout(baseSymbolListener[i]);   
            }
        }

       function clearAnimalsListenerForBonus(){
            for(var i=0;i<animalNameArray.length;i++){
                var name=animalNameArray[i];
                var animal=gr['_animal'+name];
                if(animal.clickListner){
                    animal.off('click',animal.clickListner);
                }
            }
        }

        function clearBonusAnimalsListener(bonusAnimal){
            var length=bonusAnimal.name.length;
            var name=bonusAnimal.name.substring(0,length-1);
            for(var i=0;i<4;i++){
                if(bonusAnimal===gr[name+i]){
                    continue;
                }
                gr[name+i].off('click',gr[name+i].clickListener);
            }
        }

        function resetAnimal(){
            for(var i=0;i<animalNameArray.length;i++){
                gr['_animal'+animalNameArray[i]].visible=false;
                gr['_animal'+animalNameArray[i]].$backgroundImage.gotoAndStop('symbol'+animalNameArray[i]);
                if(orientation === "landscape"){
                    gr['_animal'+animalNameArray[i]].y=450;
                }else{
                    gr['_animal'+animalNameArray[i]].y=660;
                }
            }
        }
        
        function addMaskForAnimals(){
            container=new window.createjs.Container().set();
            for(var i=0;i<12;i++){
               mask[i]=new window.createjs.Shape();
               var name=animalNameArray[i];
               mask[i].x=gr['_animal'+name].x;
               mask[i].y=gr['_animal'+name].y;               
               gr['_animal'+name].mask=mask[i]; 
               mask[i].graphics.drawRect(-100,-160,200,260).closePath(); 
               container.addChild(mask[i]);
               mask[i].scaleX=1;
               mask[i].scaleY=1;                                                              
            }  
            stage.addChild(container);
        }

        function addMaskForBonusAnimals(){
            containerBonus=new window.createjs.Container().set();
            for(var i=0;i<animalNameArray.length;i++){
                var bonusAnimal=gr['_bonusAnimal'+animalNameArray[i]];
                maskBonus[i]=new window.createjs.Shape();
                maskBonus[i].x=bonusAnimal.x;
                maskBonus[i].y=bonusAnimal.y;
                if (orientation === "landscape"){
                    maskBonus[i].graphics.drawRect(-340,-140,1200,260).closePath();
                }else{
                    maskBonus[i].graphics.drawRect(120,160,900,260).closePath();
                }
                if(gr['_PbonusAnimal'+animalNameArray[i]]){
                    var pBonusAnimal=gr['_PbonusAnimal'+animalNameArray[i]];
                    maskBonus[i+12]=new window.createjs.Shape();
                    maskBonus[i+12].x=pBonusAnimal.x;
                    maskBonus[i+12].y=pBonusAnimal.y;
                    maskBonus[i+12].graphics.drawRect(120,420,900,260).closePath();
                    pBonusAnimal.mask=maskBonus[i+12];
                    containerBonus.addChild(maskBonus[i+12]);
                }
                bonusAnimal.mask=maskBonus[i];
                containerBonus.addChild(maskBonus[i]);
            }
            stage.addChild(containerBonus);
        }

       function setScene(scene) {
            gr._GameScene.$background = scene;
            stage.canvas.parentElement.style.background = 'url({0}) center / cover no-repeat'.replace(/\{0\}/, resLib.images[gr._GameScene.$background].src);
       }
        
       function setOrientation() {
            symbolsPositionArray=[];
            for(var i=0; i<6; i++){
                var p = [];         
                var symbol = gr._baseSymbol.children[baseSymbolIndex[i][0]];   
                p.push(symbol.x);
                p.push(symbol.y);
                symbolsPositionArray.push(p);
            }
            console.log(symbolsPositionArray); 
            if (orientation === "landscape") {
                baseScene = 'landscapeBG';
                bonusScene = 'landscapeBGbonus';                        
            } else{
                baseScene = 'portraitBG';
                bonusScene = 'portraitBGbonus';              
            }
            setScene(baseScene);
        } 

        function createSymbolsArray(arraySymbols){
            for(var i=0; i<symbolsPositionArray.length; i++){
                var t = [];
                t.push(symbolsPositionArray[i][0]);
                t.push(symbolsPositionArray[i][1]);
                arraySymbols.push(t);               
            }
        }

        function symbolNumberSelect(){
            if(symbolsNumberSelectArray.length===0){
                createSymbolsArray(symbolsNumberSelectArray);
                for(var i=0;i<animalNameArray.length;i++){
                    var animal=gr['_animal'+animalNameArray[i]];
                    if(animal.visible){                 
                        for(var j=0;j<symbolsNumberSelectArray.length;j++){
                            if(animal.x===symbolsNumberSelectArray[j][0]){
                                symbolsNumberSelectArray.splice(j,1);
                            }
                        }
                    }                      
                }
            }
            var symbolNum=Math.floor(Math.random()*symbolsNumberSelectArray.length);
            var symbolNumberSelect;
            symbolNumberSelect=symbolsNumberSelectArray.splice(symbolNum,1);
            return symbolNumberSelect[0];  
        }

        function timeIntervalRandom(){
            var timeWait=Math.floor(Math.random()*200)+400;
            return timeWait;
        }  

        function indexChildPosition(aniSelect){
            var baseIndex=checkSymbolPosition(aniSelect.x);
            aniSelect.childIndex=gr._baseSymbol.children.indexOf(aniSelect);
            if(baseSymbolIndex[baseIndex][0]===aniSelect.childIndex||baseSymbolIndex[baseIndex][1]===aniSelect.childIndex){
                return;
            }
            else {
                gr._baseSymbol.swapChildrenAt(aniSelect.childIndex,baseSymbolIndex[baseIndex][0]);
                aniSelect.childIndex=baseSymbolIndex[baseIndex][0];
            }
        }

        function symAnimationRan(){	
            var numberSelect=symbolNumberSelect();
            var animalRandomNumber=animalSymbolsRandom();           
            var aniSelect=gr['_animal'+animalRandomNumber];        
            aniSelect.x=numberSelect[0]; 
            aniSelect.y=numberSelect[1]+195;
            aniSelect.mask.x=numberSelect[0];
            aniSelect.mask.y=numberSelect[1];   
            var coordinateY=numberSelect[1]+195;   
            aniSelect.coordinateY=numberSelect[1]+195;
            function handleReveal(){
                countTimer++;
                if(countTimer>Math.floor(Math.random()*4)){
                    countTimer=0;
                    this.reveal();
                }                  
            }    
            if(!aniSelect.visible){           
                aniSelect.$backgroundImage.currentAnimationFrame=0;
                aniSelect.visible=true; 
                var aniNumber=aniSelect.name.substring(7); 
                gr['_fail'+aniNumber].alpha=0;
                gr['_win'+aniNumber].alpha=0;
                gr['_bonus'+aniNumber].alpha=0; 
                indexChildPosition(aniSelect);
                order[checkSymbolPosition(aniSelect.x)]=1;              
                if(!revealAll) {                                                                                
                    tweenArray.push(cjs.Tween.get(aniSelect,{loop:false}).to({y:numberSelect[1]},300).call(function(){
                        this.clickListner=this.on('click',this.reveal,null,true);
                    }).wait(1000).call(function(){
                        this.off('click',this.clickListner);
                    }).to({y:coordinateY},300).call(function(){
                        this.visible=false;
                    })); 
                } else{
                    tweenArray.push(cjs.Tween.get(aniSelect,{loop:false}).to({y:numberSelect[1]},300).call(handleReveal).wait(1000).to({y:coordinateY},300).call(function(){
                        this.visible=false;
                    }));
                    
                }
            }
           time=timeIntervalRandom();  
           baseSymbolListener.push(setTimeout(symAnimationRan,time));
		}

        function tweenPause(){
            for(var i=0;i<tweenArray.length;i++){
               tweenArray[i].setPaused(true);
               tweenArray[i].pause();
            }
        }
  
        function checkAllRevealed() {
            if(count === 8 ){
                gr._Mask.visible=false;
                listenerForTimer.push(setTimeout(downAnimals,300));
                clearAnimalsListenerForBonus();
                if(bonusCount>0&&bonusCount===bonusVertify || bonusCount===0){
                    msgBus.publish('allPuppetsRevealed');
                }
            }
        }
            
        function showAnimals(){      
            symAnimationRan(); 
        }
         //show prize for animal
        function setAnimalPrize(prizeValue){
            for(var i=0;i<dataResult.prizeTable.length;i++){
                if(prizeValue===dataResult.prizeTable[i].description){
                    prizeValue=dataResult.prizeTable[i].prize/100;
                    return prizeValue;
                }
            }    
        }
        //change count
        function setCount(){           
            if(count<8){
                if(orientation === "landscape"){
                    cjs.Tween.get(gr['_hand0'+count],{loop:false}).to({y:900},200);
                }else{
                    cjs.Tween.get(gr['_hand0'+count],{loop:false}).to({y:1100},200);
                }
            }else{
                return;
            }
            count++;
            msgBus.publish('countChanged');
        }
        //bonus animation
        function handleBonus(animationName,bonusAnimalResult){
            gr._buttonAutoPlay.visible=false;
            gr._buttonCancel.visible=false;
            gr._buttonAutoPlayMTM.visible=false;
            gr._buttonCancelMTM.visible=false;
            gr._Hands.visible=false;
            //gr._buttonMTM.visible=false;
            resetBonusAnimals();
            msgBus.publish('bonus');    
            bonusStart=true;       
            screenAnimation();          
            gr._Text.$text.text=resLib.i18n.game.bonus_showText;  
            gr._Text.$text.shadow=new window.createjs.Shadow("#000000",5,5,10);
            gr._dropBoard.visible=true;
            gr._Value.$text.text=resLib.i18n.game.dropBoard_value;
            gr.animMap['_dropBoardAnim'].play();
            gr._Mask.visible=false;        
            listenerForTimer.push(setTimeout(function(){bonusAnimation(animationName,bonusAnimalResult);},700));
        }

        function bonusAnimalUp(){
            function addClickForBonus(){
                this.clickListener=this.on('click',this.reveal,null,true);
            }
            for(var i=0;i<animalNameArray.length;i++){
                for(var j=0;j<4;j++){
                    var bonusAnimal=gr['_bonusAnimal'+animalNameArray[i]+'0'+j];                    
                    if(bonusAnimal.visible){
                        var positionY=bonusAnimal.y-185;              
                        cjs.Tween.get(bonusAnimal,{loop:false}).to({y:positionY},700).call(addClickForBonus); 
                         
                    }
                }
            }
        }
        
        function bonusAnimation(animationName,bonusAnimalResult){
            var bonusSymbolName=animationName.substring(6);
            gr['_bonusAnimal'+bonusSymbolName].visible=true;
            for(var i=0;i<4;i++){
                 var bonusAnimal=gr['_bonusAnimal'+bonusSymbolName+'0'+i];
                 bonusAnimal.visible=true;
                 gr['_bonusFail'+bonusSymbolName+'0'+i].alpha=0;
                 gr['_bonusWin'+bonusSymbolName+'0'+i].alpha=0;
                 bonusAnimal.$backgroundImage.currentAnimationFrame=0;  
                 // var positionY=bonusAnimal.y-135;              
                 setBonusResult(bonusAnimal,bonusAnimalResult);              
            }  
        }
       
        function setBonusResult(bonusAnimal,bonusAnimalResult){
            bonusAnimal.reveal=function(){
                function bonusAnimalShow(bonusWin, bonusFail, resultNeedToShow, selectFlag){
                    if(resultNeedToShow === 'X'){
                        var failName=bonusFail.name.substring(10);
                        gr.animMap['_showBonusFail'+failName].play();
                        if(selectFlag){
                            gr._Text.$text.text=resLib.i18n.game.bonus_nowinText;     
                        }
                    } else{
                        var prizeValueForAnimal=setAnimalPrize(resultNeedToShow);
                        var winName=bonusWin.name.substring(9);
                        bonusWin.$text.text = SKBeInstant.formatCurrency(prizeValueForAnimal*100).formattedAmount;
                        bonusWin.$text.shadow=new window.createjs.Shadow("#000000",10,10,10);
                        textSizeChange(bonusWin, SKBeInstant.formatCurrency(prizeValueForAnimal*100).formattedAmount);
                        //gameUtil.fixTextFontSize(bonusWin);
                        gr.animMap['_showBonusWin'+winName].play();
                        if(selectFlag){
                            updateWinValue(prizeValueForAnimal);
                            gr._Text.$text.text=resLib.i18n.game.bonus_winText+SKBeInstant.formatCurrency(prizeValueForAnimal*100).formattedAmount;
                            listenerForTimer.push(setTimeout(function(){
                                audio.play('Reveal0',0);
                            },300));
                        }
                    }
                }
                if(!bonusAnimal.revealFlag){
                    clearBonusAnimalsListener(bonusAnimal);
                    bonusAnimal.revealFlag=true;
                    var bonusAnimalNumber=bonusAnimal.name.substring(12);
                    var animationNameOther=bonusAnimal.$backgroundImage.currentAnimation;
                    var showAnimalNum=bonusAnimalResult[2]-1; 
                    var resultAnimalShow=bonusAnimalResult[1].charAt(showAnimalNum);
                    var showNumberArray=bonusAnimalResult[1].split('');
                    gr['_bonusAnimal'+bonusAnimalNumber].$backgroundImage.gotoAndPlay(animationNameOther);
                    audio.play('Select',0);
                    
                    bonusAnimalShow(gr['_bonusWin'+bonusAnimalNumber], gr['_bonusFail'+bonusAnimalNumber], resultAnimalShow, true);
                    showNumberArray.splice(showAnimalNum,1);
                    var numOther=Number(bonusAnimalNumber.substring(bonusAnimalNumber.length-1));
                    var nameOther=bonusAnimalNumber.substring(0,bonusAnimalNumber.length-1);
                    listenerForTimer.push(setTimeout(function(){
                        for(var i=0;i<4;i++){
                            if(i===numOther){
                                continue;                                              
                            }
                            gr['_bonusFail'+nameOther+i].revealFlag=true;
                            gr['_bonusAnimal'+nameOther+i].$backgroundImage.gotoAndPlay(animationNameOther);                           
                        }
                        for(var i=0;i<4;i++){
                            if(i===numOther){
                                continue;
                            }
                            var resultAnimalShowOther=showNumberArray.shift(); 
                            bonusAnimalShow(gr['_bonusWin'+nameOther+i], gr['_bonusFail'+nameOther+i], resultAnimalShowOther, false);                             
                        }
                        
                        setTimeout(function(){
                            for(var i=0;i<4;i++){
                                if(i===numOther){
                                    continue;
                                }
                                gr['_bonusAnimal'+nameOther+i].alpha=0.7;                             
                            }
                        },500); 
                        audio.play('Select',0);        
                    },2200));
                    listenerForTimer.push(setTimeout(function(){
                        bonusCount++;
                        bonusAnimationEnd();                                                                  
                    },3000));                   
                }                              
            };    
        }

        function bonusAnimationEnd(){
            listenerForTimer.push(setTimeout(function(){
                bonusStart=false;
                screenAnimation();         
                checkAllRevealed();                 
            },2000));
        }

        function baseGameStartAfterBonus(){
            
            bonusFlag=false;
            gr._Hands.visible=true;
            if(count<8) {           
                if(!revealAll){
                    gr._buttonCancel.visible=false;
                    gr._buttonCancelMTM.visible=false;
                    gr._buttonAutoPlay.visible=true;
                    gr._buttonAutoPlayMTM.visible=true;
                    gr._buttonInfo.visible = true;
                    gr._buttonHome.visible = true;
                    if(config.wagerType === 'TRY' && (Number(config.demosB4Move2MoneyButton) !== -1)){
                        gr._buttonMTM.visible=true;
                    }
                } else{
                    gr._buttonCancel.visible=true;
                    gr._buttonCancelMTM.visible = true;
                    gr._buttonAutoPlay.visible=false; 
                    gr._buttonAutoPlayMTM.visible=false;
                    gr._buttonInfo.visible = false;
                    gr._buttonHome.visible = false;
                }
                showAnimals();            
            } else{
                gr._buttonAutoPlay.visible=false;
                gr._buttonAutoPlayMTM.visible=false;
                gr._buttonCancel.visible=false;
                gr._buttonCancelMTM.visible=false;
                gr._buttonInfo.visible = false;
                gr._buttonHome.visible = false;
            }
        }
        
        function animalSymbolsRandom(){
            if(animalsRandomSymbolArray.length===0){
                animalsRandomSymbolArray=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
                for(var i=0;i<animalNameArray.length;i++){
                    var animal=gr['_animal'+animalNameArray[i]];
                    if(animal.visible){
                        var index=animalsRandomSymbolArray.indexOf(animalNameArray[i]);
                        if(index!==-1){
                            animalsRandomSymbolArray.splice(index,1);
                        }
                    }                      
                }
            }
            var animalSymbolsNum=Math.floor(Math.random()*animalsRandomSymbolArray.length);
            var selectAnimal=animalsRandomSymbolArray.splice(animalSymbolsNum,1);
            return selectAnimal;
        }

        function checkSymbolPosition(num){
            for(var i=0;i<symbolsPositionArray.length;i++){
                if(num===symbolsPositionArray[i][0]){
                    return i;    
                }
            }
        }
        //show animal animation result
        function setAnimalResult(animal,resultAnimal){
            animal.reveal=function(){                           
                    clickedAnimal=animal;
                    clearBaseSymbolListener();
                    clearAnimalsListenerForBonus();
                    tweenPause();
                    var animationName=animal.$backgroundImage.currentAnimation;
                    var maskNum=checkSymbolPosition(animal.x);
                    gr._Mask.visible=true;                  
                    var show=animationName.substring(6);
                    for(var i=0;i<6;i++){
                        if(maskNum===i){
                            gr['_mask0'+maskNum].visible=true;  
                        }else{
                            gr['_mask0'+i].visible=false;  
                        }
                    }
                    setCount();                  
                    listenerForTimer.push(setTimeout(function(){
                        animal.$backgroundImage.gotoAndPlay(animationName);
                        audio.play('Select',0);
                        handleResult();
                    },300));             
                    function handleResult(){
                        if(resultAnimal==='M'){     
                            gr.animMap['_showBasefail'+show].play();
                        } else if(resultAnimal.split(':').length===3){  
                            var bonusArray=resultAnimal.split(':');                                              
                            if(bonusArray[0]==='B'){  
                                gr._buttonMTM.visible=false;                     
                                gr['_bonus'+show].$backgroundImage.gotoAndPlay('bonusS'+animationName.substring(1));
                                gr.animMap['_showBasebonus'+show].play();
                                var bonusAnimalResult=bonusArray;
                                clearBaseSymbolListener();
                                clearAnimalsListenerForBonus();
                                bonusFlag=true;                          
                                listenerForTimer.push(setTimeout(function(){handleBonus(animationName,bonusAnimalResult);},1000));
                                listenerForTimer.push(setTimeout(function(){
                                    audio.play('Reveal1',0);
                                },300));
                            }    
                        }else{
                            var baseArray=resultAnimal.split(':');
                            var prizeValueForAnimal=setAnimalPrize(baseArray[1]);
                            gr['_win'+show].$text.text = SKBeInstant.formatCurrency(prizeValueForAnimal*100).formattedAmount;
                            gr['_win'+show].$text.shadow=new window.createjs.Shadow("#000000",10,10,10);
                            //gameUtil.fixTextFontSize(gr['_win'+show]);
                            textSizeChange(gr['_win'+show], SKBeInstant.formatCurrency(prizeValueForAnimal*100).formattedAmount);
                            gr.animMap['_showBasewin'+show].play();    
                            updateWinValue(prizeValueForAnimal);  
                            listenerForTimer.push(setTimeout(function(){
                                audio.play('Reveal0',0);    
                            },300));  
                        } 
                    }
                    if(resultAnimal.split(':')[0]!=='B'){
                        listenerForTimer.push(setTimeout(function(){checkAllRevealed();},1000));	 
                    }
            };
            
        } 

        function updateWinValue(value){           
            prizeUpdate+=value;
            var flag = (count === 8) && (bonusCount>0&&bonusCount===bonusVertify || bonusCount===0);
            if(prizeUpdate*100 > prizeValueSum || (flag && prizeUpdate*100 < prizeValueSum)){
                msgBus.publish('jLotteryGame.error',{errorCode:'29000',errorDescriptionSpecific: ' '});
                msgBus.publish('stopRevealAll');
            }
            gr['_winsValue'].$text.text=SKBeInstant.formatCurrency(prizeUpdate*100).formattedAmount;
        }	
        
        function clickAnimal(){
            for(var i=0;i<animalNameArray.length;i++){
                var animal=gr['_animal'+animalNameArray[i]];
                setAnimalResult(animal,result[count]);                  
            }      
        }
        
        function onStartUserInteraction(data) {
            dataResult=data;
            gr._Hands.visible=true;                
            result = data.scenario.split('|');
            if (!result) {
                 msgBus.publish('jLottery.error', 'Cannot parse server response');
            }
            prizeValueSum = data.prizeValue;
            for(var i=0;i<result.length;i++){
                if(result[i].charAt(0)==='B'){
                    bonusVertify++;
                }
            }
            clickAnimal();     
            showAnimals();                   			
        }
        
        function onCountChanged(){
            if(count<8){
                clickAnimal(); 
            }
            listenerForTimer.push(setTimeout(function(){  
                downAnimals();                       
                if(clearBaseSymbolListenerFlag&&count<8&&clickedAnimal&&!bonusFlag){
                    clearBaseSymbolListenerFlag=false;                     
                    gr._Mask.visible=false;                                          
                    setTimeout(function(){
                        showAnimals();                     
                    },300);
                }    
            },2000));            
        }

        function onReStartUserInteraction(data) {   
            resetAll();
            onStartUserInteraction(data);
        }

        function removeTweensForAnimal(){
            for(var i=0;i<animalNameArray.length;i++){
                var animal=gr['_animal'+animalNameArray[i]];
                cjs.Tween.removeTweens(animal);
            }
        }

        function onReInitialize() {
            removeTweensForAnimal();
            changeHands();
            resetAll();
        }

        function onEnterResultScreenState(){
            clearBaseSymbolListener();
            clearAnimalsListenerForBonus();   
            gr._buttonAutoPlay.visible=false;
            gr._buttonCancel.visible=false;
            gr._buttonAutoPlayMTM.visible=false;
            gr._buttonCancelMTM.visible=false;   
        }

        function onStartRevealAll(){
            clearAnimalsListenerForBonus();
            revealAll=true;
        }

        function onStopRevealAll(){
            revealAll=false;
            if(count<8&&!bonusFlag){
                msgBus.publish('enablePlayWithMoneyUI');
            }
        }

        function cloneAnimationForGlad(){
            for(var i=0;i<animalNameArray.length;i++){
                var baseFailName='_showBasefail'+animalNameArray[i];
                var baseFailNameList=['_fail'+animalNameArray[i]];
                gr.animMap['_showBonusFailI00'].clone(gr,baseFailNameList,baseFailName);
                var baseWinName='_showBasewin'+animalNameArray[i];
                var baseWinNameList=['_win'+animalNameArray[i]];
                gr.animMap['_showBonusFailI00'].clone(gr,baseWinNameList,baseWinName);
                var baseBonusName='_showBasebonus'+animalNameArray[i];
                var baseBonusNameList=['_bonus'+animalNameArray[i]];
                gr.animMap['_showBonusFailI00'].clone(gr,baseBonusNameList,baseBonusName);
                for(var j=0;j<4;j++){
                    var bonusWinName='_showBonusWin'+animalNameArray[i]+'0'+j;
                    var bonusWinNameList=['_bonusWin'+animalNameArray[i]+'0'+j];
                    gr.animMap['_showBonusFailI00'].clone(gr,bonusWinNameList,bonusWinName);
                    var bonusFailName='_showBonusFail'+animalNameArray[i]+'0'+j;
                    if(gr.animMap[bonusFailName]){
                        continue;
                    }
                    var bonusFailNameList=['_bonusFail'+animalNameArray[i]+'0'+j];
                    gr.animMap['_showBonusFailI00'].clone(gr,bonusFailNameList,bonusFailName);               
                }
            }  
        }
        function init(){          
            if(orientation === "landscape") {
                addListenerForScreen('screen','screenBack'); 
                if(config.locale ==='zh_cn'){
                    gr._Value.y=151;
                } else{
                    gr._Value.y=131;
                }
            }
            else { 
               addListenerForScreen('portraitScreen','portraitScreenBack');  
               if(config.locale ==='zh_cn'){
                    gr._Value.y=161;
                } else{
                    gr._Value.y=141;
                }
            }  
            cloneAnimationForGlad();
        }
		
		function onReset() {
			onReInitialize();
		}
        
        function onOpenTutorial(){
            gr._Hands.alpha = 0;
            //changeHands();  
        }
        
        function onCloseTutorial(){
            gr._Hands.alpha = 1;
            changeHands();  
        }

        setOrientation();   
        resetAll();
        init();
                
        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe('startRevealAll',onStartRevealAll);
        msgBus.subscribe('stopRevealAll',onStopRevealAll);
        msgBus.subscribe('countChanged',onCountChanged);
        msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
		msgBus.subscribe('jLotterySKB.reset', onReset);
        msgBus.subscribe('openTutorial', onOpenTutorial);
        msgBus.subscribe('closeTutorial', onCloseTutorial);
 
        return {};
    };
});