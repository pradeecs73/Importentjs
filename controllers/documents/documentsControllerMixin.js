define(['app', 'services/documentsService'],
    function (app, documentsService) {
        var MAX_LENGTHS = {
            'list-view': { 'title': 100, 'summary': 400},
            'grid-view': { 'title': 50, 'summary': 150}
        };
        app.DocumentsControllerMixin = Ember.Mixin.create({
            sharingEnabled: function() {
                return this._isActionEnabled("sharing");
            }.property(),
            deleteEnabled: function() {
                return this._isActionEnabled("delete");
            }.property(),
            downloadEnabled: function() {
                return this._isActionEnabled("download");
            }.property(),
            multiSelectEnabled: function() {
                return this._isActionEnabled("multiselect");
            }.property(),
            sharedWithEnabled: function() {
                return this._isActionEnabled("sharedWith");
            }.property(),
            taggingEnabled: function() {
                return this._isActionEnabled("tagging");
            }.property(),
            uploadEnabled: function() {
                return this._isActionEnabled("upload");
            }.property("actionsEnabled.upload"),
            _isActionEnabled: function(action) {
                if (this.actionsEnabled)
                    return this.actionsEnabled[action];
                else
                    return this.parentController.actionsEnabled[action];
            },
            searchBoxText: function() {
                return this.get('searchText')
            }.property('searchText'),

            isMyDocumentsView: function() {
                return true;
            }.property(),

            isGridView: function() {
                return this.get('_currentView') == 'grid-view';
            }.property("_currentView"),

            maxLength: function(property) {
                return MAX_LENGTHS[this._currentView][property];
            },

            hasSearchText: function() {
                return this.get('searchText') != ""
            }.property("searchText"),
            actions: {
                filter: function(filters) {
                    this.set('filters', filters.join(';'));
                    this.set('pageNumber', 1)
                },
                search: function() {
                    this.set('searchText', this.get('searchBoxText'));
                    this.set('filters', '');
                    this.set('pageNumber', 1);
                    this.set('sortBy', this.get('hasSearchText') ? 'relevance' : 'uploadedOn');
                    this.set('sortOrder', 'desc');
                },
                gotoPage: function(pageValue) {
                    this.set('pageNumber', pageValue)
                },
                cloudletFilter: function(filterType) {
                    this.set("filterType", filterType);
                    this.set('pageNumber', 1)
                },
                toggleSortOrder: function(){
                    var toggledSortOrderMap ={
                        'asc' : 'desc',
                        'desc': 'asc'
                    }
                    this.set('sortOrder',toggledSortOrderMap[this.sortOrder]);
                },
                updateSortBy: function(sortByField) {
                    this.set('sortBy', sortByField);
                }
            }

        })
    });