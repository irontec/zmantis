RelationshipData= {};

(function(){
	RelationshipData = function(obj){
        this.id = obj.id;
        var temp_obj =  new ObjectRef(obj.type);
        this.type = temp_obj;
        this.target_id = obj.target_id;
        return this;
    };
    RelationshipData.prototype ={
        id      : 0,
        type    : null,
        target_id : 0,
        
        setTargetId : function(name){
            this.target_id = target_id;
            return this;
        },
        setId : function(id){
            this.id = id;
            return this;
        },
        setType: function(type){
        	this.type.push(type);
        	return this;
        },
        render : function(){
        	return this.type[0].name;
        }
    };
})();