define([
    'skbJet/component/resourceLoader/resourceLib',
    'skbJet/componentCRDC/splash/splashLoadController',
    'skbJet/componentCRDC/splash/splashUIController'
], function(resLib, splashLoadController, splashUIController) {

    var progressBarDivHeightSign = 0;
    var progressBarDivWidth = 406;
    var progressBarDivHeight = 70;
    var barButtonWidth = 72;
    var barButtonHeight = 70;

    var loadDiv, progressBarDiv, progressDiv, gameImgDiv;
    var softId = window.location.search.match(/&?softwareid=(\d+.\d+.\d+)?/);
    var showCopyRight = false;
    var loadingBarButton = document.createElement('div');
    if(softId){
        if(softId[1].split('-')[2].charAt(0) !== '0'){
            showCopyRight = true;
        }                
    }  

    function checkScreenMode() {
        var winW = Math.floor(Number(window.innerWidth));
        var winH = Math.floor(Number(window.innerHeight));
        return winW >= winH ? "landScape" : "portrait";
    }

    function updateLayoutRelatedByScreenMode() {
        if (checkScreenMode() === 'landScape') {
            document.getElementById('loadDiv').style.backgroundImage = 'url(' + resLib.splash.landscapeLoading.src + ')';
            progressBarDivHeightSign = 480;
        } else {
            document.getElementById('loadDiv').style.backgroundImage = 'url(' + resLib.splash.portraitLoading.src + ')';
            progressBarDivHeightSign = 700;
        }
    }

    function onLoadDone() {
        updateLayoutRelatedByScreenMode();
        gameImgDiv = document.getElementById("gameImgDiv");
        loadDiv = document.getElementById("loadDiv");
        progressBarDiv = document.getElementById("progressBarDiv");
        progressDiv = document.getElementById("progressDiv");
        if(showCopyRight){
            var copyRightDiv = document.getElementById('copyRightDiv');
            copyRightDiv.innerHTML = resLib.i18n.splash.splashScreen.footer.shortVersion;
            copyRightDiv.style.color = '#FFFFFF';
        }
        loadDiv.style.backgroundSize = 'cover';
        if(checkScreenMode() === 'portrait'){
            progressBarDiv.style.transform = 'scale(0.77)';
        }
        progressBarDiv.style.backgroundImage = 'url(' + resLib.splash.loadingBarBack.src + ')';
        progressDiv.style.backgroundImage = 'url(' + resLib.splash.loadingBarFront.src + ')';
        
        loadingBarButton.style.backgroundImage = 'url(' + resLib.splash.mushroom.src + ')';
        loadingBarButton.style.backgroundSize = 'cover';
        loadingBarButton.style.position='absolute';

        progressBarDiv.style.backgroundRepeat = 'no-repeat';
        progressBarDiv.style.width = progressBarDivWidth;       
        progressBarDiv.style.height = progressBarDivHeight;
        progressBarDiv.style.left = (loadDiv.offsetWidth - progressBarDiv.offsetWidth) / 2;

        progressDiv.style.width = progressBarDivWidth;
        progressDiv.style.height = progressBarDivHeight;
        progressDiv.style.left = 0;

        loadingBarButton.style.width = barButtonWidth;
        loadingBarButton.style.height = barButtonHeight;
        loadingBarButton.style.left = 0;
        progressBarDiv.appendChild(loadingBarButton);

        splashUIController.onSplashLoadDone();
        window.addEventListener('resize', onWindowResized);
        onWindowResized();
        window.postMessage('splashLoaded', window.location.origin);
        window.addEventListener('message', onMessage, false);
    }

    function onWindowResized() {
        updateLayoutRelatedByScreenMode();
        progressBarDiv.style.width = splashUIController.scale(progressBarDivWidth);
        progressBarDiv.style.height = splashUIController.scale(progressBarDivHeight);
        progressBarDiv.style.left = (loadDiv.offsetWidth - progressBarDiv.offsetWidth) / 2 + "px";
        progressBarDiv.style.top = splashUIController.scale(progressBarDivHeightSign);

        progressDiv.style.height = splashUIController.scale(progressBarDivHeight);
        loadingBarButton.style.width = splashUIController.scale(barButtonWidth);
        loadingBarButton.style.height = splashUIController.scale(barButtonWidth);
        loadingBarButton.style.top=splashUIController.scale(-20);
    }

    function onMessage(e){
		var percentLoadedStr = e.data.loaded || null;
        var _progressBarWidth = parseInt((progressBarDiv.style.width), 10);
		var posX =_progressBarWidth - parseInt((progressDiv.style.left), 10)* 4 -40;	
		if (percentLoadedStr !== null) {
			loadingBarButton.style.left = posX * (parseInt(progressDiv.style.width)/100) + "px";
		}
	}

    function init() {
        splashUIController.init({ layoutType: 'IW' });
        splashLoadController.load(onLoadDone);
    }
    
    init();
    return {};
});