Category = {};
(function(){
    Category = function(obj){
    	this.type = 'Category';
    	this.id = obj;
    	this.name = obj;
        return this;
    };
    Category.prototype ={
        id      : 0,
        name    : null,
        setName : function(name){
            this.name = name;
            return this;
        },
        setId : function(id){
            this.id = id;
            return this;
        },
        getId   : function(){
            return this.id;
        },
        getName     : function(){
            return this.name;
        },
        render : function(){
        	return '<span class="Category">'+this.name+'</span>';
        }
    };
})();
