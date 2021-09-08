/*:ja
 * @plugindesc アイテムメニュー画像化カスタマイズ - v1.00
 * @author 
 *
 * @param Catergory Window X
 * @desc カテゴリ窓X
 * @type number
 * @min -99999
 * @default 0
 *
 * @param Catergory Window Y
 * @desc カテゴリ窓Y
 * @type number
 * @min -99999
 * @default 0
 *
 * @param Catergory Window Width
 * @desc カテゴリ窓横幅
 * @type number
 * @min 0
 * @default 100
 *
 * @param Catergory Window Height
 * @desc カテゴリ窓縦幅
 * @type number
 * @min 0
 * @default 40
 *
 * @param Category Window Column
 * @desc カテゴリ窓項目数
 * @type number
 * @min 0
 * @default 5
 *
 * @param Item Window X
 * @desc アイテム窓x
 * @type number
 * @min -99999
 * @default 0
 *
 * @param Item Window Y
 * @desc アイテム窓y
 * @type number
 * @min -99999
 * @default 0
 *
 * @param Item Window Width
 * @desc アイテム窓横幅
 * @type number
 * @min -99999
 * @default 500
 *
 * @param Item Window Height
 * @desc アイテム窓縦幅
 * @type number
 * @min -99999
 * @default 600
 *
 * @param Item Window Column
 * @desc アイテム窓横項目数
 * @type number
 * @min 0
 * @default 4
 *
 * @param Item Window Row per Page
 * @desc アイテム窓表示縦項目数
 * @type number
 * @min 0
 * @default 8
 * 
 * @param CategoryInfoData
 * @desc カテゴリー窓・項目データ
 * @type CategoryData
 * @default 
 * 
 */
/*~struct~CategoryData:
 * 
 * @param DisplayName
 * @desc 表示名
 * @type string
 * @default 
 * 
 * @param FilterCondition
 * @desc フィルター条件
 * @type string
 * @default 
 * 
 * @param PictureName
 * @desc 画像ファイル名（空白の場合DisplayNameでの文字カテゴリが適用されます）
 * @type string
 * @default 
 *
*/
(() => {
    const script = "kzmz_ItemScene";
    const parameters = PluginManager.parameters(script);

    const categoryWindowData = {};
    categoryWindowData.x = Number(parameters['Catergory Window X'] || 0);
    categoryWindowData.y = Number(parameters['Catergory Window Y'] || 0);
    categoryWindowData.width = Number(parameters['Catergory Window Width'] || 100);
    categoryWindowData.height = Number(parameters['Catergory Window Height'] || 40);
    categoryWindowData.column = Number(parameters['Catergory Window Column'] || 5);
    categoryWindowData.infoData = JSON.parse(parameters['CategoryInfoData']).map(
        function (e) {
            let newObj = JSON.parse(e);
            return newObj;
        }
    ) || [];
    
    const kz_Window_ItemCategory_prototype_initialize = Window_ItemCategory.prototype.initialize;
    Window_ItemCategory.prototype.initialize = function(rect) {
        let newRect = new Rectangle(categoryWindowData.x, categoryWindowData.y, categoryWindowData.width, categoryWindowData.height)
        kz_Window_ItemCategory_prototype_initialize.call(this, newRect);
    };
})();