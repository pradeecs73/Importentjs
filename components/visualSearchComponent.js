define(['app', 'text!templates/components/visualSearchComponent.hbs','underscore'],
    function(app, visualSearchTemplate,_) {
        app.VisualSearchComponent = Ember.Component.extend({
            layout: Ember.Handlebars.compile(visualSearchTemplate),
            didInsertElement: function(){
                this.initialize();
            },

            initialize : function(){
                var componentId = this.get('componentId')
                var facets = this.get('facets')
                _.each(facets,function(val,key){
                  if(val == ""){
                    delete facets[key]
                  }
                  _.each(val,function(sval){
                    if(sval == "") {
                      val.removeObject("");
                    }
                  })
                })
                var filters = this.get('filters')
                var placeholder = this.get('placeHolderText')
                var component = this
                var query = ''


                if(filters){
                    query = _.map(filters.split(';'),function(filter){
                        var filterSplit = filter.split(':')
                        var newFacets = {}
                        if (facets) {
                            _.each(Object.keys(facets),function(key){
                                if(key === filterSplit[0] && facets[key].contains(filterSplit[1])){
                                    facets[key].removeObject(filterSplit[1]);
                                }
                                if(facets[key].length > 0){ newFacets[key] = facets[key]}
                            })
                            facets = newFacets;
                        }

                        return filterSplit[0] + ': "' + filterSplit[1] + '"'
                    }).join(' ')
                }
                 VS.init({
                    container : $('#'+ componentId),
                    query     : query,
                    readonly : false,
                    minLength: 0,
                    placeholder: placeholder,
                    callbacks : {
                        search : function(filters, searchCollection) {
                            var filtersArray = _.map(searchCollection.facets(),function(filter){
                                var key = Object.keys(filter)[0]
                                return  key + ":" + filter[key]
                            })
                            component.sendAction('searchAction', filtersArray)
                        },
                        facetMatches : function(callback) {
                            callback(Object.keys(facets));
                        },
                        valueMatches : function(facet, searchTerm, callback) {
                          var options = {
                            preserveOrder: true
                          };
                          var sortedValues = _.sortBy(facets[facet], function(value){ return value.toLowerCase()})
                          callback(sortedValues, options);
                        }
                    }
                });
            }.observes("filters","facets")

        })

    });