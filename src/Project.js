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
 * Project
 * 
 * This object is the logical representation of a Project in Mantis.
 * 
 *  
 * 
 */

Project = {};

(function(){
	/***
	 * Project constructor
	 * 
	 * @param: a generic object used to create the new project
	 */
    Project = function(obj){
    	this.type = 'Project';

    	for (var x in obj) {
        	//If it's an object, we check if it's null
            if((obj[x] != null) && ((typeof(obj[x]))== 'object' ) ){
            	var fn ;
        	
            	//create a new object of the type indicated by the type field
            	switch(x){
	            	case 'access_min' :
	        		case 'status' :
	        		case 'view_state' : fn = 'ObjectRef'; break;
	        		case 'subprojects': fn = 'Project'; break;
            	}
            	
            	// If the next object is an aray, we create automatically an arrayof Objects
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
        

    Project.prototype ={
        id      	: 0,
        access_min	: null,
        description : null,
        enabled		: false,
        file_path	: null,
        name 		: null,
        subprojects : [],
        status		: null,
        view_state	: null,
        
        setName : function(name){
            this.name = name;
            return this;
        },
        setId : function(id){
            this.id = id;
            return this;
        },
        getId   :   function(){
            return this.id;
        },
        getName   :   function(){
            return this.name;
        },
        render : function(){
        	html = '';
        	html += '<span class="project"><a id="'+this.id+'" href="#" class="btn large">'+this.name+'</a></span>';
        	return html;
        }
    };
})();

