AttachmentData = {};
(function(){
    AttachmentData = function(obj){
    	this.type = 'AttachmentData';
    	
    	this.id = obj.id;
    	this.filename = obj.filename;
    	this.size = obj.size; 
    	this.content_type = obj.content_type;
    	this.date_submitted = obj.date_submitted;
    	this.download_uri= obj.download_uri;
    	
   	
        return this;
    };
    
    AttachmentData.prototype ={
        id      : 0,
        filename    : null,
        size: null,
        content_type: null,
        date_submitted: null,
        download_uri: null,
        
        setFilename : function(filename){
            this.filename = filename;
            return this;
        },
        setId : function(id){
            this.id = id;
            return this;
        },
        setSize: function(size){
        	this.size = size;
        	return this;
        },
        setContentType: function(content_type){
        	this.content_type = content_type;
        	return this;
        },
        setDateSubmitted: function(date_submitted){
        	this.date_submitted = date_submitted;
        	return this;
        },
        setDownloadUri: function(download_uri){
        	this.download_uri = download_uri;
        	return this;
        },
        render : function(){
        	var link;
        	this.filename != null ? link = '<a href="'+this.download_uri+'">Jeitsi</a>': '';
        	return '<span class="AttachmentData" id="'+this.id+'">'+link+'</span>';
        }
    };
})();
