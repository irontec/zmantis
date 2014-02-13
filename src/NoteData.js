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
 * NoteData is used for the management of Notes attached to a certain Issue
 * 
 */

NoteData= {};


(function(){
	NoteData = function(obj){
                this.type = 'NoteData';	
		var temp_obj = new AccountData(obj.reporter);

		var temp_view = null;
                //ugly hack
                if (obj.view_state){temp_view = new ObjectRef(obj.view_state);}
       
		this.id = obj.id;
        this.reporter = temp_obj;
        this.text = obj.text
        this.view_state = temp_view;
        
        // This field is conditional to be compatible with previous versions of Mantis
        // that don't have time_tracking enabled 
        if (obj.time_tracking){
        	this.time_tracking = obj.time_tracking;
        }
        this.date_submitted = obj.date_submitted;
        this.last_modified = obj.last_modified;        
        
        
        return this;
    };
    
    NoteData.prototype ={
        id      : 0,
        reporter    : null,
        text : null,
        view_state : null,
        time_tracking 	: 0,
        date_submitted : null,
        last_modified : null,
        
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
        	var html = '';
        	
        	//Update with time_tracking rendering when set to our mantisbt
        	//<td>'+this.time_tracking+'<td>
        	html += '<table><tr>\
	    				<td>'+this.id+'<br/>'+this.reporter.real_name+'<br/>'+this.date_submitted+'</td>\
	    				<td>'+this.text+'</td>\
	    			</tr></table>';
        	return html;
        }
    };
})();
