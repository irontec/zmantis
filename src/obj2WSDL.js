/****************************************************************************
 **
 ** Copyright (C) 2011 Irontec SL. All rights reserved.
 **
 ** This file may be used under the terms of the GNU General Public
 ** License version 3.0 as published by the Free Software Foundation
 ** and appearing in the file LICENSE.GPL included in the packaging of
 ** this file.  Please review the following information to ensure GNU
 ** General Public Licensing requirements will be met:
 **
 ** This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 ** WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 **
 ****************************************************************************/
/***
 * Issue is the logic representation of the Mantis Issues.
 * 
 * Has the same fields as the object returned by the mantis SOAP 
 * 
 */
IssueData= {};

(function() {
	/***
	 * Constructor based in an object, normally created from a SOAP response 
	 */
    IssueData=function(obj) {
    	
        for (var x in obj) {
        	//If it's an object, we check if it's null
            if(((typeof(obj[x]))== 'object' )&& (x)){
            	var fn ;
        	
            	//create a new object of the type indicated by the type field
            	switch(x){
	            	case 'status' :
	        		case 'severity' :
	        		case 'resolution' : 
	        		case 'reproducibility':
	        		case 'projection' :
	        		case 'project':
	        		case 'priority':
	        		case 'eta':
	        			
	        		case 'view_state' : fn = 'ObjectRef'; break;
	        		
	        		case 'reporter' : fn = 'AccountData'; break;
	        		case 'relationships' : fn = 'RelationshipData'; break;
	        		case 'notes' : fn = 'NoteData'; break;
	        		case 'handler': fn = 'AccountData'; break;
	        		case 'custom_fields': fn = 'CustomFieldValueForIssue'; break;
	        		case 'attachments': fn = 'AttachmentData'; break;
            	}
            	
            	//Depending on the complext type, we create the objects and push to an array
                if (obj[x].constructor == Array){
                    //var fn = obj[x].type;
                	var temp_array = [];
            		obj[x].forEach(function (i){
            			var value = i;
	                    var tmpfn;
	                    
	                    eval("tmpfn = "+fn);
	                    var temp_obj = new tmpfn(value);
	                    temp_array.push(temp_obj);
            		});
            		this[x] = temp_array;
                 }else{
                		var value = obj[x];
	                    var tmpfn;
	                    eval("tmpfn = "+fn);
	                    var temp_obj = new tmpfn(value);
	                    this[x] = temp_obj;
                 }
            }else{
                this[x] = obj[x];
            }
        }
        /***********/
        return this;
    };
    
    // Prototype declared for introspection issues, just in case
    IssueData.prototype= {
        id  :   0,
        view_state:  null,
        last_updated: null,
        project: null,
        category: null,
        priority: null,
        severity: null,
        status: null,
        reporter: null,
        summary: null,
        version: null,
        build: null,
        platform: null,
        os: null,
        os_build: null,
        reproducibility: null,
        date_submitted: null,
        sponsorship_total: null,
        handler: null,
        projection: null,
        eta: null,
        resolution: null,
        fixed_in_version: null,
        description: null,
        steps_to_reproduce: null,
        additional_information: null,
        attachments: [],
        relationships: [],
        notes: [],
        custom_fields: [],
        paint : function(p1) {

        },
        setName : function(name) {
            this.name= name;
            return this;
        },
        setId : function(id) {
            this.id= id;
            return this;
        },
        getId   : function(){
            return this.id;
        },
        getSummary  : function(){
            return this.summary;
        },
        setObjectRef : function(obj){
            this.objectRef.push(obj);
            return this;
        },
        
        setHandler : function(obj){
        	this.handler = new AccountData(obj);
        	return this;
        	
        },
        setPriority	: function(obj){
        	this.priority = new ObjectRef(obj);;
        	return this;
        },
        setStatus	: function(obj){
        	this.status = new ObjectRef(obj);;
        	return this;
        },
        render : function(){
        	//return HTML content
        	return '<span class="issue" id="'+this.id+'">ID: '+this.id+': '+this.summary+'<br/></span>';
        },
        renderDetail : function() {
        	var html = '';
        	var handler = '';
        	this.handler == null ? handler = '' : handler = this.handler.render();
        	html += '<table class="issueDetail" id="'+this.id+'">\
        				<tr>\
        					<td>ID</td><td>Kategoria</td><td>Zuhurtasun</td><td>Birsortu</td><td>Bidalita</td>\
        				</tr>\
        				<tr>\
    						<td id="issue_id">'+this.id+'</td><td>'+this.category+'</td><td>'+this.severity.render()+'</td><td>'+this.reproducibility.render()+'</td><td>'+this.date_submitted+'</td>\
    					</tr>\
        				<tr>\
    						<td>Berriemailea</td><td>'+this.reporter.render()+'</td>\
    					</tr>\
    					<tr>\
							<td>Nori esleitua</td><td id="assigned_to">'+handler+'</td>\
						</tr>\
						<tr>\
							<td>Lehentasuna</td><td id ="issue_priority">'+this.priority.render()+'</td>\
						</tr>\
						<tr>\
							<td>Egoera</td><td id="issue_status">'+this.status.render()+'</td>\
						</tr>\
						<tr>\
							<td>Laburpena</td><td id="issue_summary">'+this.summary+'</td>\
						</tr>\
						<tr>\
							<td>Deskribapena</td><td>'+this.description+'</td>\
						</tr>\
        			</table>';
			return html;
        }
    };
})();
