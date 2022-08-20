/*:ja
 * @plugindesc メニュー系シーン背景設定 - v1.00
 * @author 剣崎宗二
 * 
 * @target MZ
 *
 * @param SceneBackData
 * @desc シーン背景とシーンの対照表
 * @type struct<SceneGraphicPair>[]
 * 
 * @param UseExistingBackground
 * @desc Yesだと既存の背景（メニューを開いた際のスクショ）を差し替えるのではなく、その上に重ねる形になります。
 * @type boolean
 * 
 * @help kzmz_MenuBackground.js
 * ！メニューにしか効きません！
 */
/*~struct~SceneGraphicPair:
 * @param sceneName
 * @desc シーン名(Scene_Menu等)
 * @type string
 * 
 * @param background
 * @desc 背景画像名（System/menubackフォルダ内)
 * @type string
 * 
 * @param blendMode
 * @desc ブレンドモード（UseExistingBackground = true時のみ適用) 0=NORMAL 1=ADD 2=MULTIPLY 3=SCREEN
 * @type number
 * @min 0
 * @max 4
 */

(function () {
    const script = "kzmz_MenuBackground";
    var parameters = PluginManager.parameters(script);

    console.log(parameters['SceneBackData']);
    var sceneBackPair = JSON.parse(parameters['SceneBackData']).map(e => e ? JSON.parse(e) : null);
    var coExistBackground = parameters['UseExistingBackground'] == "true";
    console.log(parameters['UseExistingBackground']);
    console.log(coExistBackground);

    ImageManager.loadMenuBackground = function (filename) {
        return this.loadBitmap("img/system/menuback/", filename);
    };

    var kz_SceneManager_backgroundBitmap = SceneManager.backgroundBitmap;
    SceneManager.backgroundBitmap = function () {
        var applicableScene = this._nextScene ? this._nextScene : this._scene;
        if (applicableScene && !coExistBackground) {
            var backgroundTarget = sceneBackPair.find(e => e.sceneName == applicableScene.constructor.name);
            if (backgroundTarget) return ImageManager.loadMenuBackground(backgroundTarget.background)
        }
        return kz_SceneManager_backgroundBitmap.call(this);
    };

    var kz_Scene_MenuBase_prototype_createBackground = Scene_MenuBase.prototype.createBackground;
    Scene_MenuBase.prototype.createBackground = function () {
        kz_Scene_MenuBase_prototype_createBackground.call(this);
        if (coExistBackground) {
            var backgroundTarget = sceneBackPair.find(e => e.sceneName == this.constructor.name);
            if (!backgroundTarget)
            {
                console.log("no background found for " + this.constructor.name)
                return;
            }
            this._backSprite2ndLayer = new Sprite();
            this._backSprite2ndLayer.bitmap = ImageManager.loadMenuBackground(backgroundTarget.background);
            this._backSprite2ndLayer._blendMode = backgroundTarget.blendMode;
            console.log(this._backSprite2ndLayer._blendMode);
            this.addChild(this._backSprite2ndLayer);
        }
    };
})();