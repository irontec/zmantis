CustomFieldValueForIssue= {};

(function(){
	CustomFieldValueForIssue = function(obj){
		this.type = 'CustomFieldValueForIssue';
		
        var temp_obj = new ObjectRef(obj.field);
        this.field = temp_obj;
        this.value = obj.value;
       
        return this;
    };
    CustomFieldValueForIssue.prototype ={
    	field : null,
        value: null,
        
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
        	return '<span class="CustomFieldValueForIssue" id="'+this.id+'">'+this['field'].render()+' '+this.value+ '</span>';
        }
    };
})();
