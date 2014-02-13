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
 * ironmantis
 * 
 * This object works as wrapper for the zMantis Zimlet SOAP petitions to Mantis
 *  
 * This zimlets invokes some Mantis bugtracking system methods for Importing/Exporting data. The object
 * responsible for that task is ironmantis (@see mantisestapi.js). Originally, this method
 * invokation was made via Mantis bugtracking system SOAP API , proxying
 * all petitions through a jsp (@see redirect.jsp) which manages how data is sent to
 * Mantis bugtracking system server.
 * 
 * @param url 	@Deprecated
 * @param u		Username
 * @param p		Password
 * @param obj	zMantis Zimlet object
 *  
 */
function ironmantis(obj) {
		
	this.parent = obj;
	
}

/***
 * ironmantis.prototype._doPOST
 *
 * This function sends JSON petitions to a local JSP (redirect.jsp)
 * which actually sends the final messages to Mantis bugtracking system
 * This JSP acts as a proxy for all petitions from zMantis. The reason
 * for this is that, in some cases we want some task done in server
 * side (that's the JSP) and other in the client side (that's this
 * JavaScript code) 
 * 
 * @param url		@Deprecated
 * @param params	JSON structure
 * @param callback	Callback Function after async Ajax call
 */
ironmantis.prototype._doPOST = function (action, soaparams, callback) {

   var soap = new SOAPClientParameters();
   soap.add("username", this.user);
   soap.add("password", this.pass);
   if (soaparams){
       for (var i in soaparams){
           soap.add(i, soaparams[i]);
       }

   }
   var soapUrl = this.parent.getResource("src/redirect.jsp");
   SOAPClient.real_mantis = this.url;
   SOAPClient.invoke(soapUrl, action, soap, true, callback);
}


ironmantis.prototype.setLoginData = function (u, p, url){
    this.url = url;
    this.user = u;
    this.pass = p;

    return this;
    
}

/**
 * Retrieve Data Petitions
 */
ironmantis.prototype.getUserProjects = function(callback){
    this._doPOST("mc_projects_get_user_accessible", null, callback);
}

ironmantis.prototype.getAccessLevels = function(callback){
    this._doPOST("mc_enum_access_levels", null, callback);
}

ironmantis.prototype.getProjectHumans = function(projectId, accessLevel, callback){
    var soap =  new Object();
    soap["project_id"]= projectId;
    soap["access"] = accessLevel;

    this._doPOST("mc_project_get_users", soap, callback);
}

ironmantis.prototype.getProjectIssues = function(projId, callback){
    var soap =  new Object();
    soap['project_id'] = projId;
    soap['page_number'] = 1;
    soap['per_page'] = 200;

    this._doPOST("mc_project_get_issue_headers", soap, callback);
}


ironmantis.prototype.getProjectCategories = function(projId, callback){
    var soap = new Object();
    soap['project_id'] = projId;

    this._doPOST("mc_project_get_categories", soap, callback);
}

/**
 *  Creation Petitions 
 */
ironmantis.prototype.createIssue = function(issue, callback){
    var soap = new Object();
    soap['issue'] = issue;

    var ret = this._doPOST("mc_issue_add", soap, callback);
    return ret;
}

ironmantis.prototype.createNote = function(issueId, noteData, callback){
    var soap = new Object();
    soap['issue_id'] = issueId;
    soap['note'] = noteData;

    var ret = this._doPOST("mc_issue_note_add", soap, callback);
    return ret;
}

ironmantis.prototype.setAttachment = function(issueID, filename, type, link, callback){
    var soap = new Object();
    soap['issue_id'] = issueID;
    soap['name'] = filename;
    soap['file_type'] = type;
    soap['content'] = link;

    return this._doPOST("mc_issue_attachment_add", soap, callback);
}
