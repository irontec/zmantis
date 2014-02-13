AccountData = {};
(function(){
    AccountData = function(obj){
    	this.type = 'AccountData';
    	this.id = obj.id;
    	this.name = obj.name;
    	this.real_name = obj.real_name;
    	this.email = obj.email;

  	
        return this;
    };
    AccountData.prototype ={
        id      : 0,
        name    : null,
        real_name: null,
        email: null,
        setName : function(name){
            this.name = name;
            return this;
        },
        setId : function(id){
            this.id = id;
            return this;
        },
        setRealName: function(real_name){
        	this.real_name = real_name;
        	return this;
        },
        setEmail: function(email){
        	this.email = email;
        	return this;
        },
        getId   : function(){
            return this.id;
        },
        getRealName : function(){
            return this.real_name;
        },
        getName     : function(){
            return this.name;
        },
        render : function(){
        	return '<span class="AccountData">'+this.real_name+'</span>';
        }
    };
})();
