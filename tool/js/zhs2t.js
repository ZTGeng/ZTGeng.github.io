
var app = new Vue({
    el: "#app",
    data: {
        textInput: "",
        outputItems: [],

        currentItemIndex: -1,
        modalOptions: [],
        modalTop: 0,
        modalLeft: 0,

        showRareChar: false,
        showClipboardError: false,
        timeout: null
    },
    computed: {
        showModal: function() { return this.currentItemIndex > -1; }
    },
    watch: {
        textInput: function() {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.timeout = null;
                this.autoResizeInputBox();
            }, 500);
        }
    },
    methods: {
        convert: function() {
            this.outputItems = [];
            this.currentItemIndex = -1;
            this.modalOptions = [];
            this.modalTop = 0;
            this.modalLeft = 0;

            var currentItem = {
                index: 0,
                type: "plain",
                text: ""
            };
            var itemList = [];
            var index = 0;
            var prev, prevprev;
            while(index < this.textInput.length) {
                let char = String.fromCodePoint(this.textInput.codePointAt(index));

                if (char.length === 0) {
                    break;
                } else if (char.length > 1) {
                    // emoji charactors
                    currentItem.text += char;
                } else if (char === '\n') {
                    // line break
                    if (currentItem.text.length > 0) {
                        itemList.push(currentItem);
                    }
                    itemList.push({
                        index: itemList.length,
                        type: "br"
                    });
                    currentItem = {
                        index: itemList.length,
                        type: "plain",
                        text: ""
                    };
                } else if (!canConvertS(char)) {
                    // not a convertable charactor
                    currentItem.text += char;
                } else {
                    let next;
                    if (index + 1 < this.textInput.length) {
                        next = String.fromCodePoint(this.textInput.codePointAt(index + 1));
                    }
                    let multiOptionsObject = multiOptions[char];
                    // when skipping multi options, will treat as normal
                    if (multiOptionsObject && (this.showRareChar || !multiOptionsObject.skip(prev, next))) {
                        // multi options
                        if (currentItem.text.length > 0) {
                            itemList.push(currentItem);
                        }

                        let nextnext;
                        if (next && next.length === 1 && index + 2 < this.textInput.length) {
                            nextnext = String.fromCodePoint(this.textInput.codePointAt(index + 2));
                        }
                        itemList.push({
                            index: itemList.length,
                            type: "clickable",
                            char: multiOptionsObject.default(prev, next, prevprev, nextnext),
                            options: multiOptionsObject.options
                        });

                        currentItem = {
                            index: itemList.length,
                            type: "plain",
                            text: ""
                        };
                    } else {
                        // normal
                        let i = zh_s.indexOf(char);
                        currentItem.text += (i < 0 ? char : zh_t[i]);
                    }
                }

                index += char.length;
                prevprev = prev;
                prev = char;
            }
            if (currentItem.text.length > 0) {
                itemList.push(currentItem);
            }
            this.outputItems = itemList;
        },
        clearText: function() {
            this.textInput = "";
            this.outputItems = []
            this.currentItemIndex = -1;
            this.modalOptions = [];
            this.modalTop = 0;
            this.modalLeft = 0;
            this.showClipboardError = false;
        },
        copyToClipboard: function() {
            const textarea = document.createElement("textarea");
            textarea.value = this.$refs.outputbox.innerText;
            document.body.appendChild(textarea);
            textarea.select()
            if (!document.execCommand("copy")) {
                this.showClipboardError = true;
            }
            document.body.removeChild(textarea);
        },
        autoResizeInputBox: function() {
            app.$refs.inputbox.style.height = 'auto';
            app.$refs.inputbox.style.height = app.$refs.inputbox.scrollHeight + 'px';
        },
        onCharClick: function(index, options) {
            this.modalOptions = options;
            this.currentItemIndex = index;
            var tag = this.$refs["i" + index][0];
            this.modalTop = tag.offsetTop + tag.offsetHeight;
            this.$nextTick(() => {
                // nextTick needed because modal width is on changing
                this.modalLeft = Math.min(tag.offsetLeft, this.$refs.outputbox.offsetLeft + this.$refs.outputbox.offsetWidth - this.$refs.modal.offsetWidth);
            });
        },
        onOptionClick: function(char) {
            this.outputItems[this.currentItemIndex].char = char;
            this.currentItemIndex = -1;
            this.modalOptions = [];
            this.modalTop = 0;
            this.modalLeft = 0;
        },
        hideModal: function() {
            this.currentItemIndex = -1;
        }
    }
});