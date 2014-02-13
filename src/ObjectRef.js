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
 * ObjectRef is a complex type for managing the enum types.
 * 
 * The constructor requires an object to be created.
 */

ObjectRef = {};

(function(){
    ObjectRef = function(obj){
    	this.type = 'ObjectRef';
    	
        this.id = obj.id;
        this.name = obj.name;
        
        return this;
    };
    ObjectRef.prototype ={
        id      : 0,
        name    : null,
        getName : function(){
            return this.name;
        },
        getId : function(){
            return this.id ;
        },
        setName : function(name){
            this.name = name;
            return this;
        },
        setId : function(id){
            this.id = id;
            return this;
        },
        render : function(){
        	return this.name;
        }
    };
})();
