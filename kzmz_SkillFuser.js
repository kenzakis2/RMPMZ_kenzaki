/*:ja
 * @plugindesc 特定の装備ステートクラスにより既存のスキルにボーナス能力を合成し与える
 *
 * @target MZ
 * 
 * 
 * @help
 * タグは
 * スキルタグ：
 * <asTag: ofs> スキルのジャンル指定
 * 
 * <addToSkill:3,4>　スキル3に4を合成
 * <addToTag: ofs, 4> 　スキルで<asTag: ofs>の有る物に4を合成
 * 
 * 合成されるのは式と特徴と説明文
 * 式/説明文に<original> があるとそこに元のスキルの式を埋め込む（ないと差し替えられる）
 */
(() => {
    const kz_DataManager_isSkill = DataManager.isSkill;
    DataManager.isSkill = function(item) {
        return kz_DataManager_isSkill.call(this, item) || (item && item._isFusedSkill);
    };

    const kz_DataManager_extractMetadata = DataManager.extractMetadata;
    DataManager.extractMetadata = function (data) {
        kz_DataManager_extractMetadata.call(this, data);
        data.skillFuseData = [];
        DataManager.extractSpecificTagAsProperty(data, 'skillFuseData', 'asTag')
        DataManager.extractSpecificTagAsProperty(data, 'skillFuseData', 'addToSkill')
        DataManager.extractSpecificTagAsProperty(data, 'skillFuseData', 'addToTag')
        this.parseSkillFuse(data);
    };

    DataManager.extractSpecificTagAsProperty = function (data, container, property) {
        const regBase = `<${property}:([^>]*)>`
        const regExp = new RegExp(regBase, 'g');
        let dataContainer = data[container];
        dataContainer[property] = [];
        for (; ;) {
            const match = regExp.exec(data.note);
            if (match) {
                dataContainer[property].push(match[1].trim());
            } else {
                break;
            }
        }
    };

    DataManager.parseSkillFuse = function (data) {
        data.skillFuseData.addToSkillReal = [];
        data.skillFuseData.addToTagReal = []

        if (data.skillFuseData.addToSkill) {
            data.skillFuseData.addToSkill.forEach(element => {
                const parsedElement = element.split(',');
                data.skillFuseData.addToSkillReal[`skill${parsedElement[0]}`] = Number(parsedElement[1])
            });
        }

        if (data.skillFuseData.addToTag) {
            data.skillFuseData.addToTag.forEach(element => {
                const parsedElement = element.split(',');
                data.skillFuseData.addToTagReal[parsedElement[0].trim()] = Number(parsedElement[1]);
            });
        }
    };



    const kz_Game_Action_prototype_item = Game_Action.prototype.item;
    Game_Action.prototype.item = function () {
        const originalItem = kz_Game_Action_prototype_item.call(this);

        //２重合成は防止する事！
        if (this.subject() && this.isSkill() && originalItem && !originalItem._isFusedSkill) {
            const baseSkillArray = this.listAllFuseSkill(originalItem);

            let addedSkillArray = Array.from(new Set(baseSkillArray));

            let resultItem = JsonEx.makeDeepCopy(originalItem)
            addedSkillArray.forEach(e => {
                let newSkill = $dataSkills[e];
                fuseSkill(resultItem, newSkill);
                resultItem._isFusedSkill = true;
            });
            return resultItem._isFusedSkill ? resultItem : originalItem;
        }

        return originalItem;
    };

    Game_Action.prototype.listAllFuseSkill = function (originalItem) {
        return this.subject().traitObjects().reduce((r, obj) => {
            if (obj.skillFuseData.addToSkillReal && obj.skillFuseData.addToSkillReal[`skill${originalItem.id}`]) {
                r = r.concat(obj.skillFuseData.addToSkillReal[`skill${originalItem.id}`])
            }
            originalItem.skillFuseData.asTag.forEach(e => {
                if (obj.skillFuseData.addToTagReal && obj.skillFuseData.addToTagReal[e]) {
                    console.log(obj.skillFuseData.addToTagReal[e].id);
                    r = r.concat(obj.skillFuseData.addToTagReal[e])
                }
            })
            return r;
        }, []);
    }

    const kz_Window_SkillList_prototype_makeItemList = Window_SkillList.prototype.makeItemList;
    Window_SkillList.prototype.makeItemList = function() {
        kz_Window_SkillList_prototype_makeItemList.call(this);
        this._data = this._data.map(e => {
            const action = new Game_Action(this._actor);
            action.setItemObject(e);
            return action.item();
        })
    };

    function fuseSkill(original, newSkill)
    {
        //ダメージ計算式
        const origFormula = original.damage.formula;
        original.damage.formula = newSkill.damage.formula;
        original.damage.formula = original.damage.formula.replace("<original>", origFormula);

        //説明文
        const origDesc = original.description;
        original.description = newSkill.description;
        original.description = original.description.replace("<original>", origDesc);

        //特徴
        original.effects.concat(newSkill.effects); 


        //その他各項目（直接差し替え可能）
        if (newSkill.iconIndex)
        {
            original.iconIndex = newSkill.iconIndex;
        }

        if (newSkill.scope)
        {
            original.scope = newSkill.scope;
        }

        if (newSkill.animationId)
        {
            original.animationId = newSkill.animationId;
        }

        if (newSkill.damage.type)
        {
            original.damage.type = newSkill.damage.type;
        }

        if (newSkill.damage.elementId)
        {
            original.damage.elementId = newSkill.damage.elementId;
        }
    }

    

})();