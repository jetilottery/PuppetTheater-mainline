/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([], function () {
    function isInactiveBtn(sp){
        var img = sp.$backgroundImage.currentAnimation;
        if(img && img.match(/Inactive$/)){
            return true;
        }
        return false;

    }
    function gladButton(sp, imgName, options){
        sp.activeImg = imgName;
        sp.inactiveImg = imgName + 'Inactive';
        sp.overImg = imgName + 'Over';
        sp.pressedImg = imgName + 'Pressed';
        sp.options = {};
        sp.options.scaleXWhenClick = 1;
        sp.options.scaleYWhenClick = 1;
        sp.options.scaleXWhenOver = 1;
        sp.options.scaleYWhenOver = 1;
        sp.originalScaleX = sp.scaleX;
        sp.originalScaleY = sp.scaleY;
        if(options){
            if(options.scaleXWhenClick){
                sp.options.scaleXWhenClick = Number(options.scaleXWhenClick);
            }
            if(options.scaleYWhenClick){
                sp.options.scaleYWhenClick = Number(options.scaleYWhenClick);
            }
            if(options.scaleXWhenOver){
                sp.options.scaleXWhenOver = Number(options.scaleXWhenOver);
            }
            if(options.scaleYWhenOver){
                sp.options.scaleXWhenOver = Number(options.scaleYWhenOver);
            }
        }
        sp.on('mouseover', function(){
            if(!isInactiveBtn(sp)){
                sp.$backgroundImage.gotoAndStop(sp.overImg);
                if(sp.options.scaleXWhenOver !==1 || sp.options.scaleYWhenOver !==1){
                    sp.scaleX = sp.options.scaleXWhenOver;
                    sp.scaleY = sp.options.scaleYWhenOver;
                }
            }
        });
        sp.on('mouseout', function(){
            if(!isInactiveBtn(sp)){
                sp.$backgroundImage.gotoAndStop(sp.activeImg);
                sp.scaleX = sp.originalScaleX;
                sp.scaleY = sp.originalScaleY;
            }
        });
        sp.on('mousedown', function(){
            if(!isInactiveBtn(sp)){
                sp.$backgroundImage.gotoAndStop(sp.pressedImg);
                if(sp.options.scaleXWhenClick !== 1 && sp.options.scaleYWhenClick !== 1){
                    sp.scaleX = sp.options.scaleXWhenClick;
                    sp.scaleY = sp.options.scaleYWhenClick;
                }
            }
        });
        sp.on('pressup', function(){
            if(!isInactiveBtn(sp)){
                sp.$backgroundImage.gotoAndStop(sp.activeImg);
                sp.scaleX = sp.originalScaleX;
                sp.scaleY = sp.originalScaleY;
            }
        });
//        sp.on('pressmove', function(){
//            if(!isInactiveBtn(sp)){
//                sp.$backgroundImage.gotoAndStop(sp.activeImg);
//                sp.scaleX = sp.originalScaleX;
//                sp.scaleY = sp.originalScaleY;
//            }
//        });
        sp.on('click', function(){
            if(!isInactiveBtn(sp)){
                sp.$backgroundImage.gotoAndStop(sp.activeImg);
                sp.scaleX = sp.originalScaleX;
                sp.scaleY = sp.originalScaleY;
            }
        });       
    }
    return gladButton;
});

