const WELCOME = {
    key: 0,
    texts: [
        "<p>本文是一篇《克苏鲁的呼唤》单人冒险。这是一段设定在1920年代的恐怖故事，你是其中的主角，你的选择决定了结果。它在设计上循序渐进，以轻松的方式带你了解游戏的基础规则。",
        "虽然大部分模组都要和朋友一起游玩，但这篇冒险只属于你。</p>",
        "<p>在开始游戏之前，你要准备好一本《克苏鲁的呼唤》第七版快速开始规则，和一张空白角色卡。你可以在 www.chaosium.com 上下载打印角色卡或交互式PDF角色卡，还有快速开始规则。",
        "你还需要铅笔、橡皮和游戏骰子。</p>",
        "<p>你不需要在游戏之前通读规则书。只需要找一把舒适的椅子，坐在轰鸣的炉火旁。然后读下去，按照说明行事。</p>",
        "<p>……仔细想来，还是不要离火源太近为妙。</p>"
    ],
    options: [
        { "key": 0, "text": "开始冒险"}
    ],

};

const TEXT404 = {
    key: 404,
    texts: [ "<p>找不到章节</p>" ]
};

const guideHtmlStart = "<div class='alert alert-info'>";
const guideHtmlEnd = "</div>";
const guidePlaceHolderStart = "[guide-start]";
const guidePlaceHolderEnd = "[guide-end]";

const artSkills = ['photography', 'art_1'];
const interpersonalSkills = ['charm', 'talk', "intimidate", "persuade"];
const languageSkills = ['latin', 'lang_1'];

const checkLevelNames = ["失败", "成功", "困难成功", "极难成功"];

const tempFlagPrefix = "temp_";

const half = function(value) {
    return value && Math.floor(value / 2);
};
const fifth = function(value) {
    return value && Math.floor(value / 5);
};

const roll = function(num, die) {
    let result = [];
    for (var i = 0; i < num; i++) {
        result.push(Math.floor(Math.random() * die) + 1);
    }
    return result;
};
const sum = function(array) {
    return array.reduce((a, b) => a + b, 0);
}

/**
 * 特征单元格
 * 特征在人物设定 - 特征设定阶段，由玩家一次性设定
 * characteristic: { key: "STR", value: 80, name: "力量", display: '<div>力量<small><br>STR</small></div>', highlight: 'none' }
 */
Vue.component('characteristic-cell', {
    props: ['characteristic', 'isEditable', 'options'],
    computed: {
        value: function() {
            return this.characteristic.value;
        },
        myOptions: function() {
            return [{ value: "", usedBy: "none" }].concat(this.options);
        },
        highlightValue: function() {
            return this.characteristic.highlight === 'value' || this.characteristic.highlight === 'all';
        },
        highlightHalf: function() {
            return this.characteristic.highlight === 'half' || this.characteristic.highlight === 'all';
        },
        highlightFifth: function() {
            return this.characteristic.highlight === 'fifth' || this.characteristic.highlight === 'all';
        }
    },
    watch: {
        value: function(newValue, oldValue) {
            this.$emit('onSelectChanged', { "key": this.characteristic.key, "oldValue": oldValue, "newValue": newValue });
        }
    },
    template: `<table class="d-inline text-center" style="line-height: 1">
        <tr>
            <td v-html="characteristic.display" rowspan="2" class="font-weight-bold align-middle" style="border: none; width: 3.5rem; height: 3rem; line-height: 1.2"></td>
            <td v-bind:class="{ 'bg-danger': highlightValue, 'text-white': highlightValue }" class="table-bordered align-middle" rowspan="2" style="width: 2rem">
                <select v-if="isEditable" v-model.number="characteristic.value" style="border: none">
                    <option v-for="option in myOptions" v-show="option.usedBy === 'none' || option.usedBy === characteristic.key">{{ option.value }}</option>
                </select>
                <div v-else style="font-size: 1rem">{{ characteristic.value }}</div>
            </td>
            <td v-if="!isEditable" v-bind:class="{ 'bg-danger': highlightHalf, 'text-white': highlightHalf }" class="table-bordered align-middle" style="width: 1.6rem">
                {{ half(characteristic.value) }}
            </td>
        </tr>
        <tr>
            <td v-if="!isEditable" v-bind:class="{ 'bg-danger': highlightFifth, 'text-white': highlightFifth }" class="table-bordered align-middle" style="width: 1.6rem">
                {{ fifth(characteristic.value) }}
            </td>
        </tr>
    </table>`
});

/**
 * 所有特征表格
 * characteristics: [ { key: "STR", value: undefined, name: "力量", display: '<div>力量<small><br>STR</small></div>', highlight: 'none' }, ... ]
 */
Vue.component('characteristics-table', {
    props: ['characteristics', 'isEditable'],
    data: function () {
        return {
            valueOptions: [
                { value: 80, usedBy: "none" }, { value: 70, usedBy: "none" }, { value: 60, usedBy: "none" }, { value: 60, usedBy: "none" },
                { value: 50, usedBy: "none" }, { value: 50, usedBy: "none" }, { value: 50, usedBy: "none" }, { value: 40, usedBy: "none" }
            ]
        }
    },
    methods: {
        /**
         * 特征设定阶段，玩家修改了某个特征值
         * @param param { key: "STR", oldValue: 80, newValue: 50 }
         */
        updateValueOptions: function(param) {
            // console.log(param);
            var oldOption = this.valueOptions.find(option => option.value === param.oldValue && option.usedBy === param.key);
            if (oldOption) {
                oldOption.usedBy = "none";
            }
            var newOption = this.valueOptions.find(option => option.value === param.newValue && option.usedBy === "none");
            if (newOption) {
                newOption.usedBy = param.key;
            }
            // console.log(this.valueOptions);
        }
    },
    template: `<div>
        <characteristic-cell
            v-for="characteristic in characteristics"
            v-bind:characteristic="characteristic"
            v-bind:isEditable="isEditable"
            v-bind:options="valueOptions"
            v-on:onSelectChanged="updateValueOptions"
            class="d-inline table table-sm text-center">
        </characteristic-cell>
    </div>`
});

/**
 * 所有属性表格
 * 属性在人物设定 - 属性设定阶段自动设定
 * HP: { key: "HP", value: 0, maxValue: 0, display: "耐久", highlight: "none"/"value"/"all" }
 */
Vue.component('attributes-table', {
    props: ['HP', 'San', 'Luck', 'MP'],
    template: `<table class="d-inline text-center">
        <tr>
            <td v-html="HP.display" class="font-weight-bold align-middle" style="width: 5rem; line-height: 1.2"></td>
            <td v-bind:class="{ 'bg-danger': HP.highlight === 'value', 'text-light': HP.highlight === 'value' }" class="table-bordered align-middle" style="width: 3.5rem">
                {{ HP.value }}/{{ HP.maxValue }}
            </td>
            <td v-html="San.display" class="font-weight-bold align-middle" style="width: 5rem; line-height: 1.2"></td>
            <td v-bind:class="{ 'bg-danger': San.highlight === 'value', 'text-light': San.highlight === 'value' }" class="table-bordered align-middle" style="width: 3.5rem">
                {{ San.value }}/{{ San.maxValue }}
            </td>
        </tr>
        <br>
        <tr>
            <td v-html="Luck.display" class="font-weight-bold align-middle" style="width: 5rem; line-height: 1.2"></td>
            <td v-bind:class="{ 'bg-danger': Luck.highlight === 'value', 'text-light': Luck.highlight === 'value' }" class="table-bordered align-middle" style="width: 3.5rem">
                {{ Luck.value }}
            </td>
            <td v-html="MP.display" class="font-weight-bold align-middle" style="width: 5rem; line-height: 1.2"></td>
            <td v-bind:class="{ 'bg-danger': MP.highlight === 'value', 'text-light': MP.highlight === 'value' }" class="table-bordered align-middle" style="width: 3.5rem">
                {{ MP.value }}/{{ MP.maxValue }}</span>
            </td>
        </tr>
    </table>`
});

/**
 * 技能单元格
 * 技能在人物设定 - 技能设定阶段，由玩家分两个步骤进行设定
 * skill: { key: "appraise", value: 5, name: "估价", display: '估价<small><br>Appraise</small>', highlight: 'none', checked: false }
 */
Vue.component('skill-cell', {
    props: ['skill', 'options', 'isEditable', 'isPhase2', 'occupationAndCustomSkills', 'artPoint', 'interpersonalPoint', 'languagePoint', 'universalPoint', 'hobbySkills'],
    data: function() {
        return { 'initValue': undefined };
    },
    computed: {
        value: function() {
            return this.skill.value;
        },
        phase1Options: function() {
            return [{ value: this.initValue, usedBy: "none" }].concat(this.options);
        },
        phase2Options: function() {
            if (this.isOccupationOrCustom) {
                return [this.skill.value];
            }
            return [this.initValue, this.initValue + 20];
        },
        isArt: function() {
            return artSkills.indexOf(this.skill.key) !== -1;
        },
        isInterpersonal: function() {
            return interpersonalSkills.indexOf(this.skill.key) !== -1;
        },
        isLanguage: function() {
            return languageSkills.indexOf(this.skill.key) !== -1;
        },
        isOccupationOrCustom: function() {
            return this.occupationAndCustomSkills.indexOf(this.skill.key) !== -1;
        },
        phase1Disabled: function() {
            return this.skill.key === 'cthulhu'
                || (this.universalPoint === 0
                    && !this.isOccupationOrCustom
                    && (!this.isArt || this.artPoint === 0)
                    && (!this.isInterpersonal || this.interpersonalPoint === 0)
                    && (!this.isLanguage || this.languagePoint === 0));
        },
        phase2Disabled: function() {
            return this.skill.key === 'cthulhu' || this.isOccupationOrCustom || (this.hobbySkills.length >= 4 && this.hobbySkills.indexOf(this.skill.key) === -1);
        },
        needUpdate: function() {
            return this.isEditable && this.initValue === this.skill.value && this.isOccupationOrCustom;
        },
        groupNeedUpdate: function() {
            return this.isEditable
                && this.initValue === this.skill.value
                && (this.artPoint > 0 && this.isArt
                    || this.interpersonalPoint > 0 && this.isInterpersonal
                    || this.languagePoint > 0 && this.isLanguage);
        },
        highlightValue: function() {
            return this.skill.highlight === 'value' || this.skill.highlight === 'all';
        },
        highlightHalf: function() {
            return this.skill.highlight === 'half' || this.skill.highlight === 'all';
        },
        highlightFifth: function() {
            return this.skill.highlight === 'fifth' || this.skill.highlight === 'all';
        }
    },
    watch: {
        isEditable: function(newBoolean, oldBoolean) {
            if (newBoolean) {
                this.initValue = this.skill.value;
            }
        },
        value: function(newValue, oldValue) {
            if (this.isEditable && oldValue !== undefined) {
                this.$emit('onSelectChanged', { "key": this.skill.key, "oldValue": oldValue, "newValue": newValue, "isReset": newValue === this.initValue });
            }
        }
    },
    template: `<table class="d-inline" style="line-height: 1; width: 100%">
        <tr>
            <td v-if="!isEditable" rowspan="2" class="align-middle" style="border: none">
                <input type="checkbox" v-bind:class="{ invisible: skill.key === 'credit' || skill.key === 'cthulhu' }" v-bind:checked="skill.checked" disabled>
            </td>
            <td
                v-html="skill.display"
                v-bind:class="{ 'bg-danger': needUpdate, 'bg-warning': groupNeedUpdate, 'text-white': needUpdate || groupNeedUpdate }"
                rowspan="2"
                class="font-weight-bold align-middle"
                style="border: none; width:4rem; height: 2rem; line-height: 1.2">
            </td>
            <td v-bind:class="{ 'bg-danger': highlightValue, 'text-white': highlightValue }" class="table-bordered align-middle text-center" rowspan="2" style="width: 1.2rem">
                <select v-if="isEditable && isPhase2" v-model.number="skill.value" v-bind:disabled="phase2Disabled" style="border: none">
                    <option v-for="value in phase2Options">{{ value }}</option>
                </select>
                <select v-else-if="isEditable" v-model.number="skill.value" v-bind:disabled="phase1Disabled" style="border: none">
                    <option v-for="option in phase1Options" v-show="option.usedBy === 'none' || option.usedBy === skill.key">{{ option.value }}</option>
                </select>
                <div v-else>{{ skill.value }}</div>
            </td>
            <td v-if="!isEditable" v-bind:class="{ 'bg-danger': highlightHalf, 'text-white': highlightHalf }" class="table-bordered align-middle text-center" style="width: 1rem">
                {{ half(skill.value) }}
            </td>
        </tr>
        <tr>
            <td v-if="!isEditable" v-bind:class="{ 'bg-danger': highlightFifth, 'text-white': highlightFifth }" class="table-bordered align-middle text-center" style="width: 1rem">
                {{ fifth(skill.value) }}
            </td>
        </tr>
    </table>`
});

Vue.component('skills-table', {
    props: ['skillArray', 'isEditable', 'isPhase2'],
    data: function() {
        return {
            occupationSkills: [],
            customSkills: [],
            hobbySkills: [],
            artPoint: 0,
            interpersonalPoint: 0,
            languagePoint: 0,
            universalPoint: 0,
            phase1SkillsNum: 0,
            phase2SkillsNum: 4,
            valueOptions: [
                { value: 70, usedBy: "none" }, { value: 60, usedBy: "none" }, { value: 60, usedBy: "none" }, { value: 50, usedBy: "none" },
                { value: 50, usedBy: "none" }, { value: 50, usedBy: "none" }, { value: 40, usedBy: "none" }, { value: 40, usedBy: "none" }
            ],
        };
    },
    computed: {
        occupationAndCustomSkills: function() {
            return this.occupationSkills.concat(this.customSkills);
        },
        occupationAndCustomSkillsNum: function() {
            return this.occupationAndCustomSkills.length;
        },
        hoppySkillsNum: function() {
            return this.hobbySkills.length;
        }
    },
    watch: {
        isEditable: function(newBoolean, oldBoolean) {
            if (newBoolean) {
                this.initialize();
            }
        },
        occupationAndCustomSkillsNum: function (newValue, oldValue) {
            if (!this.isEditable) {
                return;
            }
            if (newValue >= this.phase1SkillsNum) {
                this.$emit('action', "action_set_flag_false", "flag_skills1_unfinished");
            } else {
                this.$emit('action', "action_set_flag_true", "flag_skills1_unfinished");
            }
        },
        hoppySkillsNum: function (newValue, oldValue) {
            if (!this.isEditable) {
                return;
            }
            if (newValue >= this.phase2SkillsNum) {
                this.$emit('action', "action_set_flag_false", "flag_skills2_unfinished");
            } else {
                this.$emit('action', "action_set_flag_true", "flag_skills2_unfinished");
            }
        }
    },
    methods: {
        initialize: function() {
            this.occupationSkills = game.character.occupationSkills;
            this.artPoint = game.character.artPoint;
            this.interpersonalPoint = game.character.interpersonalPoint;
            this.languagePoint = game.character.languagePoint;
            this.universalPoint = game.character.universalPoint;
            this.phase1SkillsNum = this.occupationSkills.length + this.artPoint + this.interpersonalPoint + this.languagePoint + this.universalPoint;
        },
        updateValueOptions: function(param) {
            if (this.isPhase2) {
                var index = this.hobbySkills.indexOf(param.key);
                if (index === -1) {
                    this.hobbySkills.push(param.key);
                } else if (param.isReset) {
                    this.hobbySkills.splice(index, 1);
                }
                return;
            }
            var oldOption = this.valueOptions.find(option => option.value === param.oldValue && option.usedBy === param.key);
            if (oldOption) {
                oldOption.usedBy = "none";
            }
            var newOption = this.valueOptions.find(option => option.value === param.newValue && option.usedBy === "none");
            if (newOption) {
                newOption.usedBy = param.key;
            }

            if (this.occupationSkills.indexOf(param.key) === -1) {
                var index = this.customSkills.indexOf(param.key);
                if (index === -1) {
                    this.customSkills.push(param.key);
                    if (artSkills.indexOf(param.key) !== -1 && this.artPoint > 0) {
                        this.artPoint--;
                    } else if (interpersonalSkills.indexOf(param.key) !== -1 && this.interpersonalPoint > 0) {
                        this.interpersonalPoint--;
                    } else if (languageSkills.indexOf(param.key) !== -1 && this.languagePoint > 0) {
                        this.languagePoint--;
                    } else if (this.universalPoint > 0) {
                        this.universalPoint--;
                    } else {
                        console.log("Error! Add custom skill when universalPoint empty")
                    }
                } else if (param.isReset) {
                    this.customSkills.splice(index, 1);
                    if (this.artPoint < game.character.artPoint
                        && artSkills.indexOf(param.key) !== -1
                        && !artSkills.find(key => this.customSkills.indexOf(key) !== -1)) {
                            this.artPoint++;
                    } else if (this.interpersonalPoint < game.character.interpersonalPoint
                        && interpersonalSkills.indexOf(param.key) !== -1
                        && !interpersonalSkills.find(key => this.customSkills.indexOf(key) !== -1)) {
                            this.interpersonalPoint++;
                    } else if (this.languagePoint < game.character.languagePoint
                        && languageSkills.indexOf(param.key) !== -1
                        && !languageSkills.find(key => this.customSkills.indexOf(key) !== -1)) {
                            this.languagePoint++;
                    } else if (this.universalPoint < game.character.universalPoint) {
                        this.universalPoint++;
                    } else {
                        console.log("Error! Remove custom skill when universalPoint full")
                    }
                }
            }
        }
    },
    template: `<div>
        <div class="row small">
            <div v-for="range in [[0, 14], [14, 28], [28, 40]]" class="col-4" style="padding: 0px">
                <div v-for="skill in skillArray.slice(range[0], range[1])">
                    <div v-if="skill.key === 'space'" style="line-height: 0.5"><br></div>
                    <div v-else-if="skill.key === 'group'" v-html="skill.display"></div>
                    <skill-cell
                        v-else
                        v-bind:skill="skill"
                        v-bind:options="valueOptions"
                        v-bind:isEditable="isEditable"
                        v-bind:isPhase2="isPhase2"
                        v-bind:occupationAndCustomSkills="occupationAndCustomSkills"
                        v-bind:artPoint="artPoint"
                        v-bind:interpersonalPoint="interpersonalPoint"
                        v-bind:languagePoint="languagePoint"
                        v-bind:universalPoint="universalPoint"
                        v-bind:hobbySkills="hobbySkills"
                        v-on:onSelectChanged="updateValueOptions">
                    </skill-cell>
                </div>
            </div>
        </div>
        <div v-if="isEditable && !isPhase2" class="small">
            <span class="text-danger">红色为必选项。</span>
            <span class="text-warning">黄色为一组中必选一项。</span>
            <span>可自由分配：{{ universalPoint }}</span>
         </div>
    </div>`
});

Vue.component('character-form', {
    props: ['character', 'flags'],
    methods: {
        onAction: function(action, param) {
            this.$emit('action', action, param);
        }
    },
    template: `<div class="small">
        <h3>人物表</h3>
        <div class="row">
            <div class="col-4">
                <label for="inputName" class="font-weight-bold">姓名</label>
                <input type="text" class="input-sm border-bottom" id="inputName" style="width: 60%; border: none">
            </div>
            <div class="col-3">
                <label for="inputAge" class="font-weight-bold">年龄</label>
                <input type="number" class="input-sm border-bottom" id="inputAge" style="width: 50%; border: none">
            </div>
            <div class="col-5">
                <label for="occupation" class="font-weight-bold">职业</label>
                <input v-bind:value="character.occupation" type="text" class="input-sm border-bottom" id="occupation" style="width: 70%; border: none" readonly>
            </div>
        </div>
        <characteristics-table
            v-bind:characteristics="[character.STR, character.DEX, character.INT, character.CON, character.APP, character.POW, character.SIZ, character.EDU]"
            v-bind:isEditable="flags.flag_characteristics_editable">
        </characteristics-table>
        <br>
        <attributes-table v-bind:HP="character.HP" v-bind:San="character.San" v-bind:Luck="character.Luck" v-bind:MP="character.MP"></attributes-table>
        <br>
        <br>
        <h6><strong>技能</strong></h6>
        <skills-table
            v-bind:skillArray="Object.values(character.skills)"
            v-bind:isEditable="flags.flag_skills_editable"
            v-bind:isPhase2="flags.flag_skills_editing_phase_2"
            v-on:action="onAction">
        </skills-table>
        <br>
        <h6><strong>随身物品</strong></h6>
        <div class="row">
            <div v-if="flags.flag_bought_knife" class="col-2">小刀</div>
        </div>
    </div>`
});

var game = new Vue({
    el: '#app',
    data: {
        chapter: WELCOME,
        character: {
            STR: { key: "STR", value: undefined, name: "力量", display: '<div>力量<small><br>STR</small></div>', highlight: 'none' },
            CON: { key: "CON", value: undefined, name: "体质", display: '<div>体质<small><br>CON</small></div>', highlight: 'none' },
            POW: { key: "POW", value: undefined, name: "意志", display: '<div>意志<small><br>POW</small></div>', highlight: 'none' },
            DEX: { key: "DEX", value: undefined, name: "敏捷", display: '<div>敏捷<small><br>DEX</small></div>', highlight: 'none' },
            APP: { key: "APP", value: undefined, name: "外表", display: '<div>外表<small><br>APP</small></div>', highlight: 'none' },
            SIZ: { key: "SIZ", value: undefined, name: "体型", display: '<div>体型<small><br>SIZ</small></div>', highlight: 'none' },
            INT: { key: "INT", value: undefined, name: "智力", display: '<div style="line-height: 0.8">智力<small><br>INT<br>灵感idea</small></div>', highlight: 'none' },
            EDU: { key: "EDU", value: undefined, name: "教育", display: '<div>教育<small><br>EDU</small></div>', highlight: 'none' },

            HP:   { key: "HP",   value: undefined, maxValue: undefined, name: "耐久", display: '<div>耐久<small><br>Hit Point</small></div>', highlight: false },
            San:  { key: "San",  value: undefined, maxValue: undefined, name: "理智", display: '<div>理智<small><br>Sanity</small></div>', highlight: false },
            Luck: { key: "Luck", value: undefined, maxValue: undefined, name: "幸运", display: '<div>幸运<small><br>Luck</small></div>', highlight: false },
            MP:   { key: "MP",   value: undefined, maxValue: undefined, name: "魔法", display: '<div>魔法<small><br>Magic Point</small></div>', highlight: false },

            occupation: "",

            skills: {
                appraise:    { key: "appraise", value: 5, name: "估价", display: '估价<small><br>Appraise</small>', highlight: 'none', checked: false },
                archaeology: { key: "archaeology", value: 1, name: "考古学", display: '考古学<small><br>Archaeology</small>', highlight: 'none', checked: false },
                art:         { key: "group", display: '艺术/手艺<small>Art/Craft' },
                photography: { key: "photography", value: 5, name: "摄影", display: '摄影<small><br>Photography</small>', highlight: 'none', checked: false },
                art_1:       { key: "art_1", value: 5, name: "艺术/手艺", display: '<input type="text" class="border-bottom" style="width: 80%; border: none">', highlight: 'none', checked: false },
                art_end:     { key: "space" },
                charm:       { key: "charm", value: 15, name: "魅惑", display: '魅惑<small><br>Charm</small>', highlight: 'none', checked: false },
                climb:       { key: "climb", value: 20, name: "攀爬", display: '攀爬<small><br>Climb</small>', highlight: 'none', checked: false },
                credit:      { key: "credit", value: undefined, name: "信用评级", display: '信用评级<small><br>Credit Rating</small>', highlight: 'none', checked: false },
                cthulhu:     { key: "cthulhu", value: 0, name: "克苏鲁神话", display: '克苏鲁神话<small><br>Cthulhu Mythos</small>', highlight: 'none', checked: false },
                disguise:    { key: "disguise", value: 5, name: "乔装", display: '乔装<small><br>Disguise</small>', highlight: 'none', checked: false },
                dodge:       { key: "dodge", value: undefined, name: "闪避", display: '闪避<small><br>Dodge</small>', highlight: 'none', checked: false },
                drive:       { key: "drive", value: 20, name: "汽车驾驶", display: '汽车驾驶<small><br>Drive Auto</small>', highlight: 'none', checked: false },
                talk:        { key: "talk", value: 5, name: "话术", display: '话术<small><br>Fast Talk</small>', highlight: 'none', checked: false },
                fighting:    { key: "fighting", value: 25, name: "格斗", display: '格斗：斗殴<small><br>Fighting:Brawl</small>', highlight: 'none', checked: false },
                aid:         { key: "aid", value: 30, name: "急救", display: '急救<small><br>First Aid</small>', highlight: 'none', checked: false },
                history:     { key: "history", value: 5, name: "历史", display: '历史<small><br>History</small>', highlight: 'none', checked: false },
                intimidate:  { key: "intimidate", value: 15, name: "恐吓", display: '恐吓<small><br>Intimidate</small>', highlight: 'none', checked: false },
                language:    { key: "group", display: '外语<small>Language</small>' },
                latin:       { key: "latin", value: 1, name: "拉丁语", display: '拉丁语<small><br>Latin</small>', highlight: 'none', checked: false },
                lang_1:      { key: "lang_1", value: 1, name: "外语", display: '<input type="text" class="border-bottom" style="width: 80%; border: none">', highlight: 'none', checked: false },
                lang_end:    { key: "space" },
                lang_own:    { key: "lang_own", value: undefined, name: "母语", display: '母语<small><br>Own Language</small>', highlight: 'none', checked: false },
                law:         { key: "law", value: 5, name: "法律", display: '法律<small><br>Law</small>', highlight: 'none', checked: false },
                library:     { key: "library", value: 20, name: "图书馆使用", display: '图书馆使用<small><br>Library Use</small>', highlight: 'none', checked: false },
                listen:      { key: "listen", value: 20, name: "聆听", display: '聆听<small><br>Listen</small>', highlight: 'none', checked: false },
                locksmith:   { key: "locksmith", value: 1, name: "锁匠", display: '锁匠<small><br>Locksmith</small>', highlight: 'none', checked: false },
                medicine:    { key: "medicine", value: 1, name: "医学", display: '医学<small><br>Medicine</small>', highlight: 'none', checked: false },
                nature:      { key: "nature", value: 10, name: "博物学", display: '博物学<small><br>Nature World</small>', highlight: 'none', checked: false },
                persuade:    { key: "persuade", value: 10, name: "说服", display: '说服<small><br>Persuade</small>', highlight: 'none', checked: false },
                psychology:  { key: "psychology", value: 10, name: "心理学", display: '心理学<small><br>Psychology</small>', highlight: 'none', checked: false },
                ride:        { key: "ride", value: 5, name: "骑术", display: '骑术<small><br>Ride</small>', highlight: 'none', checked: false },
                science:     { key: "group", display: '科学<small>Science</small>' },
                biology:     { key: "biology", value: 1, name: "生物学", display: '生物学<small><br>Biology</small>', highlight: 'none', checked: false },
                pharmacy:    { key: "pharmacy", value: 1, name: "药学", display: '药学<small><br>Pharmacy</small>', highlight: 'none', checked: false },
                science_1:   { key: "science_1", value: 1, name: "科学", display: '<input type="text" class="border-bottom" style="width: 80%; border: none">', highlight: 'none', checked: false },
                science_end: { key: "space" },
                spot:        { key: "spot", value: 25, name: "侦查", display: '侦查<small><br>Spot Hidden</small>', highlight: 'none', checked: false },
                stealth:     { key: "stealth", value: 20, name: "潜行", display: '潜行<small><br>Stealth</small>', highlight: 'none', checked: false },
                track:       { key: "track", value: 10, name: "追踪", display: '追踪<small><br>Track</small>', highlight: 'none', checked: false }
            },

            occupationSkills: [],
            artPoint: 0,
            interpersonalPoint: 0,
            languagePoint: 0,
            universalPoint: 0
        },

        interactionOutput: "",
        checkResult: 0,
        checkResultRetain: 0,
        checkKey: "",
        opposedRollEnemyValue: 0,
        opposedRollEnemyLevel: 0,
        mpUsed: 0,

        flags: {
            flag_characteristics_editable: false,
            flag_skills_editable: false,
            flag_skills_editing_phase_2: false,
            flag_skills1_unfinished: true,
            flag_skills2_unfinished: true,
            flag_opposed_roll_phase2: false,
            flag_hp_reduced: false,
            flag_san_reduced: false,
            flag_major_wound: false,
            flag_mp_used: false,

            flag_c25_tried_four_options: false,
            flag_c120_tried_three_options: false,
            flag_found_cliff_ladder: false,
            flag_bought_knife: false,
            flag_meet_aboganster: false,
            flag_involved_fighting: false,
            flag_punish_dice: false,
            flag_searched_book_shelf: false,
            flag_found_poem_book: false,
            flag_learned_magic_aboganster: false,
            flag_learned_magic_summon: false,
            flag_learned_magic_order: false
        },

        usedChapters: [0],
        c25_options: [false, false, false, false, false, false],
        c120_options: [false, false, false, false, false]
    },
    computed: {
        content: function() {
            return this
                .chapter
                .texts
                .map(text => {
                    if (text === guidePlaceHolderStart) return guideHtmlStart;
                    if (text === guidePlaceHolderEnd) return guideHtmlEnd;
                    return text;
                })
                .join('');
        },

        hp: function() { return this.character.HP.value; },
        san: function () { return this.character.San.value; },
        mp_limit: function() { return Math.min(10, this.character.MP.value + this.character.HP.value - 1); },
        flag_hp_zero: function () { return this.character.HP.value === 0; },
        flag_san_zero: function () { return this.character.San.value === 0; },
        flag_siz_greater_than_40: function() { return this.character.SIZ.value > 40; },
        flag_dex_greater_than_siz: function() { return this.character.DEX.value > this.character.SIZ.value; },

        flag_characteristics_unfinished: function() {
            return !(this.character.STR.value && this.character.DEX.value
            && this.character.CON.value && this.character.POW.value
            && this.character.APP.value && this.character.INT.value
            && this.character.SIZ.value && this.character.EDU.value);
        },
        flag_luck_unfinished: function () { return !this.character.Luck.value; },

        flag_check_passed: function() { return this.checkResult > 0; },
        flag_check_failed: function() { return this.checkResult < 0; },
        flag_check_fumble: function() { return this.checkResult === -2; },
        flag_check_unfinished: function () { return this.checkResult === 0; },
        flag_last_check_passed: function() { return this.checkResultRetain > 0; },
        flag_last_check_failed: function() { return this.checkResultRetain < 0; },
        flag_last_check_fumble: function() { return this.checkResultRetain === -2; }

    },
    watch: {
        hp: function(newValue, oldValue) {
            if (newValue < oldValue) {
                this.flags.flag_hp_reduced = true;
            }
        },
        san: function(newValue, oldValue) {
            if (newValue < oldValue) {
                this.flags.flag_san_reduced = true;
            }
        },
    },
    methods: {
        reset: function() {
            this.interactionOutput = "";
            this.checkResult = 0;
            this.checkKey = "";
            this.flags.flag_opposed_roll_phase2 = false;
            this.opposedRollEnemyLevel = 0;
            this.opposedRollEnemyValue = 0;
            this.flags.flag_hp_reduced = false;
            this.flags.flag_san_reduced = false;
            this.flags.flag_major_wound = false;
            this.flags.flag_mp_used = false;
        },
        c_loadChapter: function(chapter) {
            console.log("Go: " + this.chapter.key + "=>" + chapter);
            axios.get("/cocgame/chapters/" + chapter + ".json")
                .then(res => {
                    this.reset();
                    this.chapter = res.data;
                    if (this.chapter.onload) {
                        this.chapter.onload.forEach(action => {
                            this[action.action](action.param);
                        });
                    }
                    this.usedChapters.push(this.chapter.key);
                });
        },
        loadChapter: function(optionKey) {
            console.log("chapter=" + this.chapter.key + "&option=" + optionKey);
            axios
                .get("/cocgame/chapters/" + chapterMap[this.chapter.key][optionKey] + ".json")
                .then(res => {
                    if (this.chapter.onleave) {
                        this.chapter.onleave.forEach(action => {
                            this[action.action](action.param);
                        });
                    }
                    this.reset();
                    this.chapter = res.data;
                    if (this.chapter.onload) {
                        this.chapter.onload.forEach(action => {
                            this[action.action](action.param);
                        });
                    }
                    this.usedChapters.push(this.chapter.key);
                })
                .catch(error => {
                    if (error.response && error.response.status === 404) {
                        this.chapter = TEXT404;
                    }
                });
        },
        shouldShow: function (condition) {
            if (condition === undefined) {
                return true;
            }
            return this.parseCondition(condition);
        },
        shouldDisable: function(condition) {
            if (condition === undefined) {
                return false;
            }
            return this.parseCondition(condition);
        },
        parseCondition: function (condition) {
            if (Array.isArray(condition)) {
                return condition.every(flag => this.parseCondition(flag));
            }
            switch (typeof condition) {
                case 'boolean':
                    return condition;
                case 'string':
                    if (condition.startsWith("!")) {
                        return !this.parseCondition(condition.slice(1));
                    }
                    if (condition.startsWith("flag_")) {
                        if (this[condition] !== undefined) return this[condition];
                        if (this.flags[condition] !== undefined) return this.flags[condition];
                        var tempFlag = tempFlagPrefix + condition;
                        if (this.flags[tempFlag] !== undefined) return this.flags[tempFlag];
                        console.log("Error! Unknown flag name when parsing");
                        return false;
                    }
                    break;
                case 'object':
                    return this[condition.match](condition.param);
                default:
                    break;
            }
            console.log("Error! Unknown option.show when parsing");
            return true;
        },
        on_action: function(action, param) {
            console.log("take action: " + action + " param: " + param);
            this[action](param);
        },
        action_set_highlight: function(param) {
            var item = this.character[param.key];
            if (!item) {
                item = this.character.skills[param.key];
            }
            item.highlight = param.level;
        },
        action_roll_luck: function() {
            var result = roll(3, 6);
            this.character.Luck.value = sum(result) * 5;
            this.interactionOutput = "掷骰结果为：" + result[0] + "、" + result[1] + "、" + result[2] + "。";
        },
        action_set_dog_and_lang_own: function() {
            this.character.skills.dodge.value = this.character.DEX.value / 2;
            this.character.skills.lang_own.value = this.character.EDU.value;
        },
        action_set_credit: function(credit) {
            this.character.skills.credit.value = parseInt(credit);
        },
        action_initial_attributes: function() {
            this.character.San.maxValue = this.character.POW.value;
            this.character.San.value = this.character.POW.value;
            this.character.MP.maxValue = Math.floor(this.character.POW.value / 5);
            this.character.MP.value = this.character.MP.maxValue;
            this.character.HP.maxValue = Math.floor((this.character.SIZ.value + this.character.CON.value) / 10);
            this.character.HP.value = this.character.HP.maxValue;
        },
        action_adjust_attribute: function(param) {
            var item = this.character[param.key];
            var delta = 0;
            var minus = false;
            switch (typeof param.delta) {
                case 'number':
                    delta = param.delta;
                    if (delta < 0) {
                        minus = true;
                        delta = -delta;
                    }
                    break;
                case 'string':
                    var temp;
                    if (param.delta.startsWith("-")) {
                        minus = true;
                        temp = param.delta.slice(1).toLowerCase().split("d", 2);
                    } else {
                        temp = param.delta.toLowerCase().split("d", 2);
                    }
                    delta = sum(roll(parseInt(temp[0]), parseInt(temp[1])));
                    break;
                default:
                    break;
            }
            if (item.key === 'HP' && minus && delta >= item.maxValue / 2) {
                this.flags.flag_major_wound = true;
            }
            if (item.key !== "Luck" && !minus && item.value + delta > item.maxValue) {
                delta = item.maxValue - item.value;
            }
            if (minus && delta > item.value) {
                delta = item.value;
            }
            item.value += minus ? -delta : delta;
            if (item.key === 'HP' && this.flags.flag_major_wound) {
                this.interactionOutput += "你受到了重伤。";
            }
            this.interactionOutput += item.name + (minus ? "减少了" : "增加了") + delta + "点。<br>"
        },
        action_set_occupation: function(occupation) {
            this.character.occupation = occupation;
        },
        action_set_occupation_skills: function(param) {
            this.character.occupationSkills = param.skills;
            if (param.art) {
                this.character.artPoint = 1;
            }
            if (param.interpersonal) {
                this.character.interpersonalPoint = 1;
            }
            if (param.language) {
                this.character.languagePoint = 1;
            }
            this.character.universalPoint = parseInt(param.universal);
        },
        action_adjust_skill: function(param) {
            this.character.skills[param.key].value += parseInt(param.delta);
        },
        action_double_skill_value: function(key) {
            this.character.skills[param.key].value *= 2;
        },
        action_double_half_value: function(key) {
            this.character.skills[param.key].value /= 2;
        },
        action_set_flag_true: function(flag) {
            this.internal_set_flag(flag, true);
        },
        action_set_flag_false: function(flag) {
            this.internal_set_flag(flag, false);
        },
        internal_set_flag: function(flag, value) {
            if (this.flags[flag] !== undefined) {
                this.flags[flag] = value;
            } else {
                var tempFlag = tempFlagPrefix + flag;
                if (this.flags[tempFlag] !== undefined) {
                    this.flags[tempFlag] = value;
                } else {
                    console.log("Error! Unknown flag name when setting");
                }
            }
        },
        action_add_temp_flag: function(flags) {
            flags.forEach(flag => {
                this.flags[tempFlagPrefix + flag] = false;
            });
        },
        action_remove_temp_flag: function(flags) {
            flags.forEach(flag => {
                this.flags[tempFlagPrefix + flag] = undefined;
            });
        },
        action_check: function(param) {
            // console.log("check: " + param.key);
            var item = param.isSkill ? this.character.skills[param.key] : this.character[param.key];
            this.checkKey = item.key;
            var target = item.value;
            if (param.level === "half") {
                target = half(item.value);
            } else if (param.level === "fifth") {
                target = fifth(item.value);
            }
            var result;
            if (param.bonus) {
                var tens1 = Math.floor(Math.random() * 10);
                var tens2 = Math.floor(Math.random() * 10);
                var units = Math.floor(Math.random() * 10);
                this.interactionOutput += "十位骰掷骰结果为：" + tens1 + "0、" + tens2 + "0，个位骰掷骰结果为：" + units + "。";
                var result1 = tens1 === 0 && units === 0 ? 100 : tens1 * 10 + units;
                var result2 = tens2 === 0 && units === 0 ? 100 : tens2 * 10 + units;
                if (param.bonus > 0) {
                    result = Math.min(result1, result2);
                    this.interactionOutput += "取较低值结果为：" + result + "，";
                } else {
                    result = Math.max(result1, result2);
                    this.interactionOutput += "取较高值结果为：" + result + "，";
                }
            } else {
                result = Math.ceil(Math.random() * 100);
                this.interactionOutput = "掷骰结果为：" + result + "，";
            }
            var fumbleValue = item.value < 50 ? 96 : 100;
            if (result === 1) {
                this.checkResult = 2;
                this.interactionOutput += item.name + "检定大成功！<br>"
            } else if (result >= fumbleValue) {
                this.checkResult = -2;
                this.interactionOutput += item.name + "检定大失败！<br>"
            } else if (result <= target) {
                this.checkResult = 1;
                this.interactionOutput += item.name + "检定成功！<br>"
            } else {
                this.checkResult = -1;
                this.interactionOutput += item.name + "检定失败！<br>"
            }
            this.checkResultRetain = this.checkResult;
            if (this.checkResult > 0 && param.onPass) {
                param.onPass.forEach(task => {
                    this.on_action(task.action, task.param);
                });
            }
            if (this.checkResult === -2 && param.onFumble) {
                param.onFumble.forEach(task => {
                    this.on_action(task.action, task.param);
                });
            }
            if (this.checkResult < 0 && param.onFail) {
                if (this.checkResult !== -2 || !param.onFumble) {
                    param.onFail.forEach(task => {
                        this.on_action(task.action, task.param);
                    });
                }
            }
        },
        action_general_roll_check: function (param) {
            var result = Math.ceil(Math.random() * 100);
            this.checkKey = "general";
            this.interactionOutput += "掷骰结果为：" + result + "，";
            if (result <= param.target) {
                this.checkResult = 1;
                this.interactionOutput += param.onPass.text + "<br>";
                if (param.onPass.actions) {
                    param.onPass.actions.forEach(action => {
                        this.on_action(action.action, action.param);
                    });
                }
            } else {
                this.checkResult = -1;
                this.interactionOutput += param.onFail.text + "<br>";
                if (param.onFail.actions) {
                    param.onFail.actions.forEach(action => {
                        this.on_action(action.action, action.param);
                    });
                }
            }
            this.checkResultRetain = this.checkResult;
        },
        action_opposed_roll: function(param) {
            if (!this.flags.flag_opposed_roll_phase2 && param.phase === 1) {
                var result = Math.ceil(Math.random() * 100);
                var level = -1;
                if (result <= param.value) {
                    level = 1;
                    if (result <= half(param.value)) {
                        level = 2;
                        if (result <= fifth(param.value)) {
                            level = 3;
                        }
                    }
                }
                this.opposedRollEnemyLevel = level;
                this.opposedRollEnemyValue = param.value;
                this.interactionOutput += "对方" + param.name + "检定 - 掷骰结果为：" + result + "，检定结果为：" + checkLevelNames[level === -1 ? 0 : level] + "。<br>";
                this.flags.flag_opposed_roll_phase2 = true;
            } else if (this.flags.flag_opposed_roll_phase2 && param.phase === 2) {
                var result = Math.ceil(Math.random() * 100);
                var item = param.key.startsWith("skills.") ? this.character.skills[param.key.slice(7)] : this.character[param.key];
                this.checkKey = item.key;
                var level = -1;
                if (result <= item.value) {
                    level = 1;
                    if (result <= half(item.value)) {
                        level = 2;
                        if (result <= fifth(item.value)) {
                            level = 3;
                        }
                    }
                }
                this.interactionOutput += "我方" + item.name + "检定 - 掷骰结果为：" + result + "，检定结果为：" + checkLevelNames[level === -1 ? 0 : level] + "。<br>";
                this.checkResult = level - this.opposedRollEnemyLevel;
                if (this.checkResult === 0) {
                    this.checkResult = item.value - this.opposedRollEnemyValue;
                    if (this.checkResult === 0) {
                        this.flags.flag_opposed_roll_phase2 = false;
                    }
                    this.interactionOutput += "对方技能值：" + this.opposedRollEnemyValue;
                    this.interactionOutput += "&nbsp;" + (this.checkResult > 0 ? "&lt;" : this.checkResult < 0 ? "&gt;" : "=") + "&nbsp;";
                    this.interactionOutput += "我方技能值：" + item.value + "。<br>";
                }
                this.interactionOutput += "对抗检定" + (this.checkResult > 0 ? "成功！<br>" : this.checkResult < 0 ? "失败！<br>" : "陷入僵局。<br>");
                this.checkResultRetain = this.checkResult;
            }
        },
        action_use_mp: function(mp) {
            this.flags.flag_mp_used = true;
            this.mpUsed = mp;
            if (this.character.MP.value >= mp) {
                this.interactionOutput += "减少了" + mp + "点魔法值。<br>"
                this.character.MP.value -= mp;
            } else {
                mp -= this.character.MP.value;
                this.interactionOutput += "减少了" + this.character.MP.value + "点魔法值和" + mp + "点耐久值。<br>"
                this.character.MP.value = 0;
                this.character.HP.value -= mp;
            }
        },
        match_mp_enough: function(mp) {
            return mp <= this.mp_limit;
        },
        action_use_magic: function() {
            var param = {
                target: Math.min(95, this.mpUsed * 10),
                onPass: { text: "施放“ 号令天之火” 成功！" },
                onFail: { text: "施放“ 号令天之火” 失败！" },
            };
            this.action_general_roll_check(param);
        },
        match_check_key: function(key) {
            return this.checkKey === key;
        },
        action_check_in_skill_box: function(key) {
            if (key === "current") {
                this.character.skills[this.checkKey].checked = true;
            } else {
                this.character.skills[key].checked = true;
            }
        },
        match_skill_box_checked(key) {
            return this.character.skills[key].checked;
        },
        action_c25_select_option: function(option) {
            this.c25_options[option] = true;
            this.flags.flag_c25_tried_four_options = sum(this.c25_options) >= 4;
        },
        match_c25_option_disabled: function(option) {
            return this.c25_options[option] || this.flags.flag_c25_tried_four_options;
        },
        action_c120_select_option: function(option) {
            this.c120_options[option] = true;
            this.flags.flag_c120_tried_three_options = sum(this.c120_options) >= 3;
        },
        match_c120_option_disabled: function(option) {
            return this.c120_options[option] || this.flags.flag_c120_tried_three_options;
        }
    }
});