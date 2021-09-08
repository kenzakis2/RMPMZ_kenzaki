/*:ja
 * @plugindesc 他プラグインで使用するフォントを登録する
 *
 * @target MZ
 *
 * 
 * @param Font Setting
 * @desc フォント名（プラグイン内で使う名前)　と実ファイルの対照表
 * @type struct<FontData>[]
 * @default []
 * 
 * @help
 * 他の関連プラグインでフォント変更を行うためのプラグインです。
 * 先にこのプラグインで、該当のフォントファイルに名前を付けてください。
 */
 /*~struct~FontData:
 * @param Name
 * @desc フォント名（プラグイン内での名前）
 * @type string
 * 
 * @param FileName
 * @desc 実ファイル名（fontsフォルダ内。拡張子までつけてください）
 * @type FileName
 * 
*/


(function () {
    const script = "kzmz_FontRegistration";
    var parameters = PluginManager.parameters(script);
    
    var _fontSettingArray = JSON.parse(parameters['Font Setting']).map(e => JSON.parse(e)) || [];

    var kz_Scene_Boot_prototype_loadGameFonts = Scene_Boot.prototype.loadGameFonts;
    Scene_Boot.prototype.loadGameFonts = function() {
        kz_Scene_Boot_prototype_loadGameFonts.call(this);

        _fontSettingArray.forEach(e => FontManager.load(e.Name, e.FileName));
    };
})();