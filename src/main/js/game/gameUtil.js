/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(function(){
     function updateFontSize(obj, fontSize) {
        obj.$text.font.replace(obj.$text.font.match(/(\d+\w{2})/)[0], fontSize + "px");
    }
    function fixMeter(gr){
        var balanceText = gr._balanceText;
        var balanceValue = gr._balanceValue;
        var meterDivision0 = gr._division_0;
        var meterDivision1 = gr._division_1;
        var ticketCostMeterText = gr._ticketCostMeterText;
        var ticketCostMeterValue = gr._ticketCostMeterValue;
        var winsText = gr._winsText;
        var winsValue = gr._winsValue;
        var len = gr._Meters.regX *2;
        var temp, balanceLeft;
        var originFont = balanceText.$text.font.match(/[0-9]+px/g).join();
        var originFontSize = originFont.match(/[0-9]+/g).join();
        if(balanceText.visible){
            updateFontSize(balanceText,originFont);
            updateFontSize(balanceValue,originFont);
            updateFontSize(ticketCostMeterText,originFont);
            updateFontSize(ticketCostMeterValue,originFont);
            updateFontSize(winsText,originFont);
            updateFontSize(winsValue,originFont);
            temp = (len - (ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision0.$text.getMeasuredWidth() + balanceText.$text.getMeasuredWidth() + balanceValue.$text.getMeasuredWidth() + meterDivision1.$text.getMeasuredWidth() + winsText.$text.getMeasuredWidth() + winsValue.$text.getMeasuredWidth()))/2 ;
            balanceLeft = (len - ticketCostMeterText.$text.getMeasuredWidth() - ticketCostMeterValue.$text.getMeasuredWidth())/2;
            balanceLeft = balanceLeft - meterDivision0.$text.getMeasuredWidth() - balanceText.$text.getMeasuredWidth() - balanceValue.$text.getMeasuredWidth();
            if(temp >= 6){
                if(balanceLeft >= 0){
                    ticketCostMeterText.x = (len - ticketCostMeterText.$text.getMeasuredWidth() - ticketCostMeterValue.$text.getMeasuredWidth())/2 + ticketCostMeterText.regX;
                    ticketCostMeterValue.x = ticketCostMeterText.x - ticketCostMeterText.regX + ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.regX;
                    meterDivision0.x = ticketCostMeterText.x - ticketCostMeterText.regX - meterDivision0.$text.getMeasuredWidth() + meterDivision0.regX;
                    balanceValue.x = meterDivision0.x - meterDivision0.regX - balanceValue.$text.getMeasuredWidth() + balanceValue.regX;
                    balanceText.x = balanceValue.x - balanceValue.regX - balanceText.$text.getMeasuredWidth() + balanceText.regX;
                    meterDivision1.x = ticketCostMeterValue.x - ticketCostMeterValue.regX + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision1.regX;
                    winsText.x = meterDivision1.x - meterDivision1.regX + meterDivision1.$text.getMeasuredWidth() + winsText.regX;
                    winsValue.x = winsText.x - winsText.regX + winsText.$text.getMeasuredWidth() + winsValue.regX;
                } else {
                    balanceText.x = temp + balanceText.regX;
                    balanceValue.x = balanceText.x - balanceText.regX + balanceText.$text.getMeasuredWidth() + balanceValue.regX;
                    meterDivision0.x = balanceValue.x - balanceValue.regX + balanceValue.$text.getMeasuredWidth() + meterDivision0.regX;
                    ticketCostMeterText.x = meterDivision0.x - meterDivision0.regX + meterDivision0.$text.getMeasuredWidth() + ticketCostMeterText.regX;
                    ticketCostMeterValue.x = ticketCostMeterText.x - ticketCostMeterText.regX + ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.regX;
                    meterDivision1.x = ticketCostMeterValue.x - ticketCostMeterValue.regX + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision1.regX;
                    winsText.x = meterDivision1.x - meterDivision1.regX + meterDivision1.$text.getMeasuredWidth() + winsText.regX;
                    winsValue.x = winsText.x - winsText.regX + winsText.$text.getMeasuredWidth() + winsValue.regX;
                }
            } else {
                var left = temp;        
                for(var fsize = Number(originFontSize)-1; fsize>=1 && left<6; fsize--){
                    var fsizeFont = fsize + 'px';
                    updateFontSize(balanceText,fsizeFont);
                    updateFontSize(balanceValue,fsizeFont);
                    updateFontSize(ticketCostMeterText,fsizeFont);
                    updateFontSize(ticketCostMeterValue,fsizeFont);
                    updateFontSize(winsText,fsizeFont);
                    updateFontSize(winsValue,fsizeFont);
                    left = (len - (ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision0.$text.getMeasuredWidth() + balanceText.$text.getMeasuredWidth() + balanceValue.$text.getMeasuredWidth() + meterDivision1.$text.getMeasuredWidth() + winsText.$text.getMeasuredWidth() + winsValue.$text.getMeasuredWidth()))/2;
                }
                balanceText.x = left + balanceText.regX;
                balanceValue.x = balanceText.x - balanceText.regX + balanceText.$text.getMeasuredWidth() + balanceValue.regX;
                meterDivision0.x = balanceValue.x - balanceValue.regX + balanceValue.$text.getMeasuredWidth() + meterDivision0.regX;
                ticketCostMeterText.x = meterDivision0.x - meterDivision0.regX + meterDivision0.$text.getMeasuredWidth() + ticketCostMeterText.regX;
                ticketCostMeterValue.x = ticketCostMeterText.x - ticketCostMeterText.regX + ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.regX;
                meterDivision1.x = ticketCostMeterValue.x - ticketCostMeterValue.regX + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision1.regX;
                winsText.x = meterDivision1.x - meterDivision1.regX + meterDivision1.$text.getMeasuredWidth() + winsText.regX;
                winsValue.x = winsText.x - winsText.regX + winsText.$text.getMeasuredWidth() + winsValue.regX;
            }
        } else {
            ticketCostMeterText.x = (len-(ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision1.$text.getMeasuredWidth() + winsText.$text.getMeasuredWidth() + winsValue.$text.getMeasuredWidth()))/2 + ticketCostMeterText.regX;
            ticketCostMeterValue.x = ticketCostMeterText.x - ticketCostMeterText.regX + ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.regX;
            meterDivision1.x = ticketCostMeterValue.x - ticketCostMeterValue.regX + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision1.regX + 10;
            winsText.x = meterDivision1.x - meterDivision1.regX + meterDivision1.$text.getMeasuredWidth() + winsText.regX + 10;
            winsValue.x = winsText.x - winsText.regX + winsText.$text.getMeasuredWidth() + winsValue.regX;
        }
    }
    
    function fixTicketSelect(gr, prizePointList, normalNumber){
        var ticketSelectWidth = gr._ticketCost.regX*2;
        var iconNumber = prizePointList.length;
        var originX = gr._ticketCostLevelIcon_0.x;
        if(iconNumber === normalNumber){
            return;
        } else {
            var scale = gr._ticketCostLevelIcon_0.scaleX;
            var lastTicketIcon = gr['_ticketCostLevelIcon_' + (iconNumber - 1)];
            var iconWidth = Math.round(lastTicketIcon.getBounds().width * scale);
            var len = lastTicketIcon.x + iconWidth - gr._ticketCostLevelIcon_0.x;
            var currentLeft = (ticketSelectWidth - len)/2;           
            var diffValue = currentLeft - originX + gr._ticketCostLevelIcon_0.regX;              
            for(var i = 0; i < iconNumber; i++){
                gr['_ticketCostLevelIcon_' + i].x = gr['_ticketCostLevelIcon_' + i].x + diffValue;
            }   
            for(var j = iconNumber; j < normalNumber; j++){
                gr['_ticketCostLevelIcon_' + j].visible = false;
            }          
        }     
    }

    function fixTextFontSize(sp){
        var txLength = sp.$text.text.length;
        //var originFont = sp.$text.font.match(/[0-9]+px/g).join();
        var spWidth = sp.regX*2;
        var txWidth = sp.$text.getMeasuredWidth();
        var acWidth = (txWidth/txLength)*(txLength+1);
        var diffOneSize = 0.49;
        if(acWidth > spWidth){
            updateFontSize(sp,(spWidth/txLength)/diffOneSize);
        }
    }
    
    return {
        fixMeter: fixMeter,
        fixTicketSelect: fixTicketSelect,
        fixTextFontSize: fixTextFontSize
    };
});

