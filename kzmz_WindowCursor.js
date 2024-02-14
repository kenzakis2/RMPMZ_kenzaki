/*:ja
 * @plugindesc 窓にカーソルをつける
 * @author Souji Kenzaki / Documented by Sairi
 * 
 * @param CursorData
 * @desc 窓とカーソルのデータ
 * @type struct<CursorDetail>[]
 * @default []
 * 
 */
/*~struct~CursorDetail:
 * 
 * @param WindowName
 * @desc 窓のタイプ名。Window_Selectable、等
 * @type string
 * 
 * @param overheadX
 * @desc rectからのX調整値
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param overheadY
 * @desc rectからのX調整値
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param CursorBMP
 * @desc カーソルのbmp名。img/cursors/　内
 * @type string
 * 
 * 
*/

(function () {
    let parameters = PluginManager.parameters('kzmz_WindowCursor');
    let _cursorList = JSON.parse(parameters['CursorData']).map(
        function (e) {
            let newObj = JSON.parse(e);
            return newObj;
        }
    ) || [];

    function findCursordata(id)
    {
        return _cursorList.find(e => e.WindowName == id);
    }

    ImageManager.loadIdCursor = function(filename) {
        return this.loadBitmap("img/cursors/", filename);
    };

    const Window_Selectable_prototype_initialize = Window_Selectable.prototype.initialize;
    Window_Selectable.prototype.initialize = function(rect) {
        Window_Selectable_prototype_initialize.call(this, rect);
        this.cursorData = findCursordata(this.constructor.name)
        if (this.cursorData)
        {
            this._idCursorSprite = new Sprite();
            this._idCursorSprite.bitmap = ImageManager.loadIdCursor(this.cursorData.CursorBMP);
            this.addChild(this._idCursorSprite);
            this._idCursorSprite.x = Number(this.cursorData.overheadX);
            this._idCursorSprite.y = Number(this.cursorData.overheadY);
        }
    };

    const Window_Selectable_prototype_refreshCursor = Window_Selectable.prototype.refreshCursor;
    Window_Selectable.prototype.refreshCursor = function() {
        Window_Selectable_prototype_refreshCursor.call(this);
        this.updateIdCursor();
    };

    Window_Selectable.prototype.updateIdCursor = function() {
        if (this._idCursorSprite)
        {
            if (this.index() >= 0)
            {
                this._idCursorSprite.visible = true;
                this._idCursorSprite.x = this._cursorRect.x + Number(this.cursorData.overheadX);
                this._idCursorSprite.y = this._cursorRect.y + Number(this.cursorData.overheadY);
            }
            else
            {
                this._idCursorSprite.visible = false;
            }
        }
    };

    const kz_Window_Selectable_prototype__updateCursor = Window_Selectable.prototype._updateCursor;
    Window_Selectable.prototype._updateCursor = function() {
        kz_Window_Selectable_prototype__updateCursor.call(this);
        if (this._idCursorSprite){
            this._cursorSprite.visible = false;
        }
    };

    
})();