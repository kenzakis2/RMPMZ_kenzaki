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
 * 
 *  @help kzmz_EquipSlotPosition.js
 * 
 * 装備スロット窓内で、各スロットの位置を自由に条件を設定して調整できるプラグインです。
 * 条件式は以下を参考に、&&でつなげてください。
 * ・アクターIDが3である場合 => actor.actorId() == 3
 * ・装備タイプIDが2 => slotType == 2
 * 
 * 
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
 * @type string
 * @default 0
 * 
 * @param y
 * @desc Y座標
 * @type string
 * @default 0
 * 
 * @param width
 * @desc 横幅
 * @type string
 * @default 100
 * 
 * @param height
 * @desc 縦幅
 * @type string
 * @default 100
 *
*/
(() => {
    const script = "kzmz_EquipSlotPosition";
    const parameters = PluginManager.parameters(script);

    const equipSlotData = JSON.parse(parameters['SlotData']).map(
        function (e) {
            let newObj = JSON.parse(e);
            newObj.Position = JSON.parse(newObj.Position);
            return newObj;
        }
    ) || [];;


    const kz_Window_EquipSlot_prototype_itemRect = Window_EquipSlot.prototype.itemRect;
    Window_EquipSlot.prototype.itemRect = function (index) {
        if (!this._actor) {
            console.log("actor not in");
            return kz_Window_EquipSlot_prototype_itemRect.call(this, index);
        }

        const actor = this._actor;
        const slotType = actor.equipSlots()[index];
        const slotCount = actor.slotCount(index); //eval用。このスロットの番号が発生するのが何番目か。同じタイプが複数ある時用

        var element = equipSlotData.find(e => eval(e.Condition))
        if (!element){
            return kz_Window_EquipSlot_prototype_itemRect.call(this, index);
        }
        var positionElement = element.Position

        console.log(eval(positionElement.y));
        
        return new Rectangle(eval(positionElement.x), eval(positionElement.y), eval(positionElement.width), eval(positionElement.height));
    };

    Game_Actor.prototype.slotCount = function(index) {
        const slot = this.equipSlots();
        const target = slot[index];
        const slotSubArray = slot.slice(0, index + 1);

        return slotSubArray.filter(e => e == target).length;
    }

})();