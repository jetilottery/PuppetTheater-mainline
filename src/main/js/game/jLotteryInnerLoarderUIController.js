define([
        'skbJet/component/gameMsgBus/GameMsgBus',
        'skbJet/component/SKBeInstant/SKBeInstant',
		'skbJet/component/resourceLoader/resourceLib',
		'skbJet/component/deviceCompatibility/windowSize'
    ], function(msgBus, SKBeInstant, resLib, windowSize){
	
	return function(){
	var loadDiv = document.createElement('div');
	var progressBarDiv = document.createElement('div');
	var progressDiv = document.createElement('div');
	var loadingBarButton = document.createElement('div');
	var orientation = 'landscape';
	var gce;
	var scaleRate = 1;

	var predefinedStyle = {
		landscape:{
			loadDiv:{
				width:960,
				height:600,
				position:'absolute',
				left: "50%",
				top: "50%"
			},
			progressBarDiv:{
				top: 480,
				left: 273,
				width:406,
				height:70,
				padding:0,
				position:'absolute'
			},
			loadingBarButton:{
				top: -17,
				left: "0%",
				width:72,
				height:70,
				padding:0,
				position:'absolute',
				backgroundRepeat:'no-repeat'
			},
			progressDiv:{
				top: 0,
				left: 0,
				height:70,
				width:"0%",
				position:'absolute',
				backgroundRepeat:'no-repeat'
			}
		},
		portrait:{
			loadDiv:{
				width:600,
				height:818,
				position:'absolute',
				left: "50%",
				top: "50%"
			},
			progressBarDiv:{
				top:700,
				left:-51,
				width:406,
				height:70,
				padding:0,
				position:'absolute',
				transform: 'scale(0.77)',
				backgroundRepeat:'no-repeat'
			},
			loadingBarButton:{
				top: 8,
				left: "0%",
				width:72,
				height:70,
				padding:0,
				position:'absolute',
				backgroundRepeat:'no-repeat'
			},
			progressDiv:{
				top: 0,
				left: 0,
				height:70,
				width:"0%",
				position:'absolute',
				backgroundRepeat:'no-repeat'
			}
		}
	};

	function applyStyle(elem, styleData){
		for(var s in styleData){
			if(typeof styleData[s] === 'number'){
				elem.style[s] = styleData[s]+'px';
			}else{
				elem.style[s] = styleData[s];
			}
		}
	}

	function updateSize(winW, winH){
        document.documentElement.style.width = winW + 'px';
        document.documentElement.style.height = winH + 'px';
        document.body.style.width = winW + 'px';
        document.body.style.height = winH + 'px';
        gce.style.width = winW + 'px';
        gce.style.height = winH + 'px';
    }
	
	function onWindowResized(){
		var gameHeight = 0, gameWidth = 0;
		var bgImgUrl = SKBeInstant.config.urlGameFolder+'assetPacks/'+SKBeInstant.config.assetPack+'/splash/' + orientation+'Loading.jpg';
		gce.style.backgroundImage = 'url('+bgImgUrl+')';
		
		if(SKBeInstant.config.assetPack === 'desktop'){
			gameHeight = SKBeInstant.config.revealHeightToUse;
			gameWidth = SKBeInstant.config.revealWidthToUse;
		}else{
			//gameWidth = Math.floor(Number(window.innerWidth));
			//gameHeight = Math.floor(Number(window.innerHeight));
			gameWidth = Math.floor(windowSize.getDeviceWidth());
			gameHeight = Math.floor(windowSize.getDeviceHeight());
		}
		if(gameHeight>gameWidth){
			orientation = 'portrait';
		}else{
			orientation = 'landscape';
		}
		updateSize(gameWidth, gameHeight);
		
		var pdd = predefinedStyle[orientation];
		if(gameWidth / pdd.loadDiv.width > gameHeight / pdd.loadDiv.height){
			scaleRate = gameHeight / pdd.loadDiv.height;
		}else{
			scaleRate = gameWidth / pdd.loadDiv.width;
		}
		applyStyle(loadDiv, pdd.loadDiv);
        applyStyle(progressBarDiv, pdd.progressBarDiv);
		//applyStyle(gameLogoDiv, pdd.gameLogoDiv);

		loadDiv.style.transform = 'scale('+ scaleRate + ',' + scaleRate +')';
		loadDiv.style.webkitTransform = 'scale('+ scaleRate + ',' + scaleRate +')';
		loadDiv.style.marginTop = -pdd.loadDiv.height/2 + "px";
		loadDiv.style.marginLeft = -pdd.loadDiv.width/2 + "px";		
	}
	
	function initUI(){
        var gameHeight = 0, gameWidth = 0;
		gce = SKBeInstant.getGameContainerElem();
		if(SKBeInstant.config.assetPack === 'desktop'){
			gameHeight = SKBeInstant.config.revealHeightToUse;
			gameWidth = SKBeInstant.config.revealWidthToUse;
		}else{
			//gameWidth = Math.floor(Number(window.innerWidth));
			//gameHeight = Math.floor(Number(window.innerHeight));
			gameWidth = Math.floor(windowSize.getDeviceWidth());
			gameHeight = Math.floor(windowSize.getDeviceHeight());
		}
		if(gameHeight>gameWidth){
			orientation = 'portrait';
		}
		loadDiv.appendChild(progressBarDiv);
		progressBarDiv.appendChild(progressDiv);
		progressBarDiv.appendChild(loadingBarButton);
		
		var bgImgUrlBase = SKBeInstant.config.urlGameFolder+'assetPacks/'+SKBeInstant.config.assetPack+'/splash/';
		progressBarDiv.style.backgroundImage = 'url('+bgImgUrlBase+'loadingBarBack.png)';
		progressDiv.style.backgroundImage = 'url('+bgImgUrlBase+'loadingBarFront.png)';
		loadingBarButton.style.backgroundImage = 'url('+bgImgUrlBase+'mushroom.png)';
		
		var pdd = predefinedStyle[orientation];
		applyStyle(loadDiv, pdd.loadDiv);
		applyStyle(progressBarDiv, pdd.progressBarDiv);
		applyStyle(progressDiv, pdd.progressDiv);
		applyStyle(loadingBarButton, pdd.loadingBarButton);
		
		if(SKBeInstant.config.assetPack !== 'desktop'){
			window.addEventListener('resize', onWindowResized);
		}
		onWindowResized();
		
		gce.style.position = "relative";
		gce.style.backgroundSize = '100% 100%';
		gce.appendChild(loadDiv);
	}

    function onStartAssetLoading(){
		if(SKBeInstant.isSKB()){
			return;
		}
		initUI();
	}
	
	function updateLoadingProgress(data){
		if(SKBeInstant.isSKB()){
			return;
		}
		var _progressBarWidth = parseInt((progressBarDiv.style.width), 10);
		var posX =_progressBarWidth - parseInt((progressDiv.style.left), 10)* 4 - 40;
		progressDiv.style.width = (data.current / data.items) * 100 + "%";
		loadingBarButton.style.left = posX * (data.current / data.items) + "px";
	}
	
	msgBus.subscribe('jLottery.startAssetLoading', onStartAssetLoading);
	msgBus.subscribe('jLotteryGame.updateLoadingProgress', updateLoadingProgress);

	};	
});