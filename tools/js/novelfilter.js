/**
 * @version 0.10
 * @author Geng
 */

(function() {
    Vue.component('item-cell', {
        props: ['item'],
        template: `<div class="col-2 ps-0 pe-2 pb-2">
        <div class="border p-2">
            <a :href="item.url || '#'" :target="item.url ? '_blank' : '_self'">
                <img :src="item.imgUrl || 'images/placeholder.jpg'" class="img-thumbnail">
                {{ item.name }}
            </a>
            <div class="d-flex flex-wrap mt-2">
                <small v-for="tag in item.tags" class="border border-light bg-light rounded me-1 mb-1 px-1">{{ tag }}</small>
            </div>
        </div>
        </div>`
    });

    Vue.component('filter-row', {
        props: ['filter'],
        computed: {
            noSelected: function() {
                return !this.filter.tags.some(tag => tag.selected);
            }
        },
        methods: {
            reset: function() {
                this.filter.tags.forEach(tag => tag.selected = false);
            },
            onClick: function(tag) {
                tag.selected = !tag.selected;
                if (tag.selected && this.filter.isSingle) {
                    this.filter.tags.filter(iTag => iTag !== tag).forEach(iTag => iTag.selected = false);
                }
            }
        },
        template: `<div class="d-flex flex-wrap align-items-center p-2">
            <strong class="me-2 mb-2">{{ filter.name }}</strong>
            <div :class="{ active: noSelected }" @click="reset" class="btn btn-light btn-sm me-2 mb-2">全部</div>
            <div v-for="tag in filter.tags" :class="{ active: tag.selected }" @click="onClick(tag)" class="btn btn-light btn-sm me-2 mb-2">
                {{ tag.name }}
            </div>
        </div>`
    });

    var app = new Vue({
        el: "#app",
        data: {
            items: [],
            filters: []
        },
        computed: {
            itemsFiltered: function() {
                var data = this.items.slice();
                this.filters
                    .map(filter => filter.tags.filter(tag => tag.selected).map(tag => tag.name))
                    .forEach(tagArray => {
                        if (tagArray.length > 0) {
                            data = data.filter(item => item.tags.some(tag => tagArray.indexOf(tag) > -1));
                        }
                    });
                return data;
            }
        },
        mounted: function() {
            this.items = this.getItems();
            this.filters = this.getFilters();
            this.filters.forEach(filter => {
                filter.tags = filter.tags.map(tag => { return { name: tag, selected: false }; })
            });
        },
        methods: {
            getItems: function() {
                // Customized by yourself
                return demoData.items;
            },
            getFilters: function() {
                // Customized by yourself
                return demoData.filters;
            }
        }
    });
})();