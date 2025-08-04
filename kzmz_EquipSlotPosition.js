/*:ja
 * @plugindesc 装備スロット配置自由化 - v1.00
 * @author 剣崎宗二
 *
 * @target MZ
 * 
 * @param SlotData
 * @desc スロットデータ
 * @type struct<SlotCondition>[]
 * @default 
 */
/*~struct~SlotCondition:
 * 
 * @param Condition
 * @desc 評価用条件式
 * @type string
 * @default 
 * 
 * @param Position
 * @desc 座標
 * @type struct<Rectangle>
 * @default 
 *
*/
/*~struct~Rectangle:
 * 
 * @param x
 * @desc X座標
 * @type number
 * @default 0
 * 
 * @param y
 * @desc Y座標
 * @type number
 * @default 0
 * 
 * @param width
 * @desc 横幅
 * @type number
 * @default 100
 * 
 * @param height
 * @desc 縦幅
 * @type number
 * @default 100
 *
*/
(() => {
    const script = "kzmz_EquipslotLocationCustom";
    const parameters = PluginManager.parameters(script);


    Window_EquipSlot.prototype.itemRect = function (index) {
        if (!this._actor) {
            return Rectangle(0, 0, 0, 0)
        }
        
        return new Rectangle(x, y, width, height);
    };

})();