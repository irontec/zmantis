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
 * com_irontec_zmantisH
 * 
 * This object works as handler for the zMantis Zimlet
 * Interaction with zimlet is divided into:
 *  - A Panel Icon where Messages or Conversations can be droped. It also
 *    has a context menu when right clicked, and options panel when single/double clicked.
 *  - A Toolbar Button. It works as dropping a Msg/Conv into the Panel Icon.
 *  - A Context Menu Button.  It works as dropping a Msg/Conv into the Panel Icon.
 *  
 * This zimlets invokes some MantisBT methods for adding new Issues and/or Notes data. The object
 * responsible for that task is ironmantis (@see mantisrestapi.js). Originally, this method
 * invokation was made via MantisBT REST API (included in version 5.5.2 and above), proxying
 * all petitions through a jsp (@see redirect.jsp) which manages how data is sent to
 * MantisBT server.
 * 
 *  
 */
function com_irontec_zmantisH() {
}
com_irontec_zmantisH.prototype = new DwtDialog;
com_irontec_zmantisH.prototype = new ZmZimletBase();
com_irontec_zmantisH.prototype.constructor = com_irontec_zmantisH;
com_irontec_zmantisH.prototype.singleClicked = function() {
    this.doubleClicked();
};


/***
 * com_irontec_zmantisH.prototype.menuItemSelected
 * 
 * This function works as wrapper for the Selected item in the Context
 * menu of the Zimlets Panel Icon
 * 
 * @param itemId    Selected item in the context menu of the panel zimlet
 */
com_irontec_zmantisH.prototype.menuItemSelected = function(itemId) {
    // Detect which Option in the Context Menu has been choosen
    switch (itemId) {
        /*** Show About Box ***/
        case "IMANTIS_ABOUT":
            var _view = new DwtComposite(this.getShell());     // Creates an empty div as a child of main shell div
            _view.setSize("350", "230");                     // Set width and height
            _view.getHtmlElement().innerHTML = this.getMessage("zmantis_aboutText");
            var _dialog = new ZmDialog({title:this.getMessage("zmantis_about"), view:_view, parent:this.getShell(), standardButtons:[DwtDialog.OK_BUTTON]});
            _dialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, function() {_dialog.popdown();}));
            _dialog.popup();                                 //Show the dialog 
            break;
            
    }
};

/***
 * com_irontec_zmantisH.prototype.initializeToolbar
 * 
 * This function works as hook for adding or editing main toolbar icons
 * 
 * It adds the zMantis button at the end of the bar, just after the 
 * View Icon. When this button is clicked, it will callback private
 * _addMantisMsg function.
 * 
 */
com_irontec_zmantisH.prototype.initializeToolbar =
    function(app, toolbar, controller, viewId) {

    if (viewId == ZmId.VIEW_CONVLIST || viewId == ZmId.VIEW_TRAD ||                     // Zimbra /
       viewId == ZmId.VIEW_CONVLIST+"-main" || viewId == ZmId.VIEW_TRAD+"-main" ){      // Zimbra 8+
        // Get the index of "View" menu so we can display the button after that
        var buttonIndex = 0;
        for (var i = 0; i < toolbar.opList.length; i++) 
            if (toolbar.opList[i] == ZmOperation.VIEW_MENU || toolbar.opList[i] == ZmOperation.ACTIONS_MENU) {
                buttonIndex = i + 1;
                break;
            }

        // Configure Toolbar button
        var buttonParams = {
            text: this.getMessage("zmantis_bn_addMantis"),
            tooltip: this.getMessage("zmantis_bn_addMantis_tooltip"),
            index: buttonIndex,
            image: "IMANTIS-panelIcon"
        };

        // Creates the button with an id and params containing the button details
        var button = toolbar.createOp("SEND_MANTIS_TOOLBAR", buttonParams);
        button.addSelectionListener(new AjxListener(this, this._addMantisMsg,controller));   
    }
};


/***
 * com_irontec_zmantisH.prototype.init
 * 
 * Init the Zimlet.
 * 
 * It adds the zMantis button at the end of context menu, just after the 
 * View Icon. When this button is clicked, it will callback private
 * _addMantisMsg function. 
 */
com_irontec_zmantisH.prototype.init = function() {
    var controller = appCtxt.getCurrentController();
    
    /* If context menu is available */
    if (controller.getActionMenu){
            var menu = controller.getActionMenu();
    
            // Find the Last Menu Position
            var buttonIndex = 0;
            for (var i = 0; i < menu.opList.length; i++) 
                if (menu.opList[i] == ZmOperation.CREATE_TASK) {
                    buttonIndex = i + 1;
                    break;
            }
        
            // Add a new button
            var menuParams = {
                text: this.getMessage("zmantis_bn_addMantis"),
                tooltip: this.getMessage("zmantis_bn_addMantis_tooltip"),
                index: buttonIndex,
                image: "IMANTIS-panelIcon"
            };
        
            // When this button is clicked execute callback
            var mi = menu.createMenuItem("SEND_MANTIS_MENU", menuParams);
            mi.addSelectionListener(new AjxListener(this, this._addMantisMsg,controller));
        }
    
    /* Start fetching Mantis Access levels 
     * This will ensure us that the connection with mantis can be established and 
     * Also we retrieve a onetime data user independent. */
    this.ironmantis = new ironmantis(this);
    // Set Authenticated flag
    this.authenticated = false;
    // Get Access levels
    this._getAccessLevels();
};

/***
 * com_irontec_zmantisH.prototype._addMantisMsg
 *
 * Callback function for Toolbar and Context Menu Item
 *
 * This function works as wrapper for the non-panel icons. It just
 * get the Message info and calls _displayMSGDialog, as it will occur
 * when some Msg/Conv is droped into the Zimlet Panel Icon
 * 
 */
com_irontec_zmantisH.prototype._addMantisMsg = function(controller) {
    var msg = controller.getMsg();
    this._checkExported(msg);
};

/***
 * com_irontec_zmantisH.prototype.doDrop
 *
 * Callback function for Zimlet Panel Icon 
 *
 * This function works as wrapper for the panel icons. It just
 * get the Message info and calls _displayMSGDialog.
 * 
 */
com_irontec_zmantisH.prototype.doDrop = function(obj) {
    // Check if we are properly logged into MantisBT. 
    
    var msg = obj.srcObj;
    
    // What kind of object are you dropping?
    switch(msg.type) {
        case "CONV":
            // Get First message from conversation
            msg = msg.getFirstHotMsg();
            // Time to rock. Process this Message!
            this._checkExported(msg);
            break;
        case "MSG": 
            // Time to rock. Process this Message!
            this._checkExported(msg);
            break;
        default:
            return false;
    }
};

/***
 * com_irontec_szmantisH.prototype.tag
 * 
 * Tags an Email with the proper TagLabel.
 * Used to tag Exported mails.
 *
 */
com_irontec_zmantisH.prototype.tag = function (msg, tagName) {
    // Get Requested tag
        var tagObj = appCtxt.getActiveAccount().trees.TAG.getByName(tagName);

    // No tag found with that name
           if(!tagObj) {
        // Create tag
        this.createTag(tagName);
        // Get created Tag
        tagObj = appCtxt.getActiveAccount().trees.TAG.getByName(tagName);
    }

    // Get Tag Command
    var tagId = tagObj.id;
    var axnType = "tag"; 
    var soapCmd = ZmItem.SOAP_CMD[msg.type] + "Request";

    var itemActionRequest = {};
    itemActionRequest[soapCmd] = {_jsns:"urn:zimbraMail"};
    var request = itemActionRequest[soapCmd];

    var action = request.action = {};
    action.id = msg.id;
    action.op = axnType;
    action.tag = tagId;

    var params = {asyncMode: true, callback: null, jsonObj:itemActionRequest};
    appCtxt.getAppController().sendRequest(params);

};

/**
 * com_irontec_zmantisH.prototype.createTag
 *
 * This function create a tag if it does not exits.
 * It should only be used once or none in most of cases
 *
 */
com_irontec_zmantisH.prototype.createTag = function (tagName){
    // Tag Creation Command
        var soapCmd = "CreateTagRequest";

    // Get Tag Request Structure
        var itemActionRequest = {};
        itemActionRequest[soapCmd] = {_jsns:"urn:zimbraMail"};
        var request = itemActionRequest[soapCmd];

    // Fill Tag Structure
        var tag = request.tag = {};
    tag.name = tagName;
    tag.color = 1;        // Blue by default

    // Request Creation
        var params = {asyncMode: false, callback: null, jsonObj:itemActionRequest};
        appCtxt.getAppController().sendRequest(params);
}

/**
 * com_irontec_zmantisH.prototype._getAccessLevels
 *
 * This functions acts as both AccessLevels Query and login check
 * If this function is properly processed without Error, we assume that we're 
 * properly authenticated
 *
 */
com_irontec_zmantisH.prototype._getAccessLevels = function(){
    // Set Login data for Mantis
    this.ironmantis.setLoginData(this.getUserPropertyInfo('my_zmantis_username').value,
                                 this.getUserPropertyInfo('my_zmantis_pass').value,
                                 this.getUserPropertyInfo('my_zmantis_url').value +
                                 '/api/soap/mantisconnect.php');

   // Request Access Levels Query
   this.ironmantis.getAccessLevels($.proxy(this._onAccessLevels, this)); 
}

/**
 * com_irontec_zmantisH.prototype._onAccessLevels
 *
 * This function acts as both callback of Access Levels and also
 * as login check function. If this petition is properly retrieved
 * we assume we are authenticated.
 *
 */
com_irontec_zmantisH.prototype._onAccessLevels = function(access){

    if (access instanceof Error){
        /** Show message */
        var msg = this.getMessage("zmantis_notValidAuth")+"<br /><small>"+this.getMessage("zmantis_name")+" "+this.getMessage("zmantis_version")+"</small>";
        appCtxt.getAppController().setStatusMsg(msg);
        this.authenticated = false;
        return;
    }

    this.accessLevels = new Map();
    for (var i=0;i<access.length;i++){
        var temp =  new ObjectRef(access[i]);
        this.accessLevels.put(temp.getId(), temp)
    }

    //Get the minimum access level to get all the users related to a project.
    this.minAccessLevel = 100000;
    var keys = this.accessLevels.listKeys();
    for (var j in keys){
        if (keys[j] < this.minAccessLevel){
            this.minAccessLevel = keys[j];
        }
    }

    // Show dialog on successuful authentication
    appCtxt.getAppController().setStatusMsg(this.getMessage("zmantis_loggedin")+"<br /><small>"+this.getMessage("zmantis_name")+" "+this.getMessage("zmantis_version")+"</small>")

    // Mark authenticated flag
    this.authenticated = true;
}    

/**
 * com_irontec_zmantisH.prototype._checkAuth
 * 
 * This function checks if we have properly logged in and
 * show a message in case we're not 
 *
 */
com_irontec_zmantisH.prototype._checkAuth = function(){

    // If not authenticated, show a message
    if (!this.authenticated){
        /** Show message */
        var msg = this.getMessage("zmantis_notValidAuth")+"<br /><small>"+this.getMessage("zmantis_name")+" "+this.getMessage("zmantis_version")+"</small>";
        appCtxt.getAppController().setStatusMsg(msg);
    }

    // Return Login status
    return this.authenticated;
}

/***************************************************************************
 **
 **                         Messages Process
 **
 **************************************************************************/

/**
 * com_irontec_zmantisH.prototype._checkExported
 *
 *
 */
com_irontec_zmantisH.prototype._checkExported = function(msg) {

        // If not properly authenticated do not continue
        if (!this._checkAuth()) return;

        // Get Exported tag
        var tagName = this.getUserPropertyInfo("my_zmantis_tag").value;
        if ( tagName != "" ){
                // Get Requested tag
                var tagObj = appCtxt.getActiveAccount().trees.TAG.getByName(tagName);
                // If Tag exists
                if (tagObj){
                        // Check if message is tagged with this tag
                        if (msg.tagHash[tagObj.id] !== undefined){
                this._dialog = appCtxt.getYesNoMsgDialog(); // returns DwtMessageDialog
                var dstyle = DwtMessageDialog.INFO_STYLE; //show info status by default
                var dmsg = this.getMessage("zmantis_confirmExport"); 
                var dtit = this.getMessage("zmantis_confirmExportTitle");

                // set the button listeners
                this._dialog.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._confirmExport,msg)); // listens for YES button events
                
                this._dialog.reset(); // reset dialog
                this._dialog.setMessage(dmsg, dstyle);
                this._dialog.setTitle(dtit);
                this._dialog.popup();
                return;
                        }
                }
            
        }

    // Display Dialog ;-)
        this._displayNewNoteDataDialog(msg);
}


/**
 * com_irontec_zmantisH.prototype._confirmExport
 *
 * This function acts as callback to the Confirmation Popup shown
 * when a tagged mail is trying to be exported. If we have reached
 * here, re-exported is being requested :]
 *
 */
com_irontec_zmantisH.prototype._confirmExport = function(msg) {
    this._dialog.popdown();
        this._displayNewNoteDataDialog(msg);
}

/***
 * com_irontec_zmantisH.prototype._loadNoteView
 * 
 * Dialog Container HTML Content.
 * @see _displayiIssueDialog for a short description of each section
 */
com_irontec_zmantisH.prototype._loadNoteView = function() {
        var html = [], i=0;
        html[i++] = "<table height='128px'>";
        html[i++] = "<tr id='zmantis_project_line' valign='top'>";
        html[i++] = "   <td width='30%'>"+this.getMessage("zmantis_destinationproject")+"</td><td id='zmantis_project'></td>";
        html[i++] = "   <td><img id='zmantis_proj_load' src='"+this.getResource("resources/loadingbar.gif")+"' height='25px' /></td></tr>";
        html[i++] = "<tr id='zmantis_category_line' valign='top'>";
        html[i++] = "    <td width='30%'>"+this.getMessage("zmantis_category")+"</td><td id='zmantis_category'></td>";
        html[i++] = "    <td><img id='zmantis_category_load' src='"+this.getResource("resources/loadingbar.gif")+"' height='25px'/></td></tr>";
        html[i++] = "<tr id='zmantis_issue_line' valign='top'>";
        html[i++] = "    <td width='30%'>"+this.getMessage("zmantis_insertissueid")+"</td><td id='zmantis_issueid'></td>";
        html[i++] = "    <td><img id='zmantis_issue_load' src='"+this.getResource("resources/loadingbar.gif")+"' height='25px'/></td></tr>";
        html[i++] = "<tr id='zmantis_human_line' valign='top'>";
        html[i++] = "    <td width='30%'>"+this.getMessage("zmantis_humans")+"</td><td id='zmantis_humans'></td>";
        html[i++] = "    <td><img id='zmantis_human_load' src='"+this.getResource("resources/loadingbar.gif")+"' height='25px'/></td></tr>";
        html[i++] = "</table>";
        html[i++] = "<div id='zmantis_title' style='padding:2px 0px 0px 2px'>"+this.getMessage("zmantis_issues")+"</div>";
        html[i++] = "<div id='zmantis_note'style='padding:bottom:2px'>"+this.getMessage("zmantis_note")+"</div>";
        html[i++] = "<div id='zmantis_atts' align='float:right'></div>";
    	if (appCtxt.getShell()._currWinSize.y >= 700) {
        	html[i++] = "   <a href='"+this.getMessage("zmantis_powered")+"' target='_blank'>";
        	html[i++] = "   <img src='"+this.getResource("resources/Poweredby.png")+"' border='0' align='right'/></a>";
	}
        return html.join("");
}


/***
 * com_irontec_zmantisH.prototype._displayNewNoteDataDialog
 *
 */
com_irontec_zmantisH.prototype._displayNewNoteDataDialog = function(msg){

    // Store message and subject
    this.msg = msg;
    var msg = msg;

    //If we're coming from a non-completed transaction, we must clear the View
    //Bugfix for http://incidencias.irontec.com/view.php?id=19185
    if (this.pNoteView) this.pNoteView.clearContent();   

    //Creates an empty div 
    this.pNoteView = new DwtComposite(this.getShell());
    if (appCtxt.getShell()._currWinSize.y < 700) {
	    this.pNoteView.setSize("550","365");
    } else {
	    this.pNoteView.setSize("550","530");
    }
    
    // Add the HTML to the dialog
    this.pNoteView.getHtmlElement().innerHTML = this._loadNoteView();
    // pass the title, view and buttons information and create dialog box
    this.pNoteDialog = new ZmDialog({title: this.getMessage("zmantis_newnote"), view:this.pNoteView, parent:this.getShell(),
                                      standardButtons:[DwtDialog.DISMISS_BUTTON, DwtDialog.OK_BUTTON] });

    /** Project Input **/
    // Array of projects
    this.mantisProjects = new Array();
    this.ironmantis.getUserProjects($.proxy(this._fillUserProjects,this));
    
    // Create Input Field
    this.ifProject =  new DwtInputField({parent:this.pNoteDialog, size:50});
    this.ifProject.getInputElement().setAttribute("id", "zmantis_pinput");
    document.getElementById("zmantis_project").appendChild(this.ifProject.getInputElement());
    // Tokenize Input Field
    $("#zmantis_pinput").tokenInput(this.mantisProjects,{
            tokenLimit:1,
            hintText: this.getMessage("zmantis_proj_sug"),
            noResultsText: this.getMessage("zmantis_proj_nores"),
            searchingText: this.getMessage("zmantis_proj_fetching"),
            preventDuplicates: true,
            onAdd: $.proxy(this._getProjectIssues,this),
            onDelete: $.proxy(this._getProjectIssues, this)
    });
    // Hide Project Input Field
    $("#zmantis_project").hide();

    /** Issue Input **/
    this.mantisIssues = new Array(); 
    this.ifProject =  new DwtInputField({parent:this.pNoteDialog, size:70});
    this.ifProject.getInputElement().setAttribute("id", "zmantis_iinput");
    document.getElementById("zmantis_issueid").appendChild(this.ifProject.getInputElement());
    // Tokenize Input Field
    $("#zmantis_iinput").tokenInput(this.mantisIssues,{
            tokenLimit:1,
            hintText: this.getMessage("zmantis_issue_sug"),
            noResultsText: this.getMessage("zmantis_issue_nores"),
            searchingText: this.getMessage("zmantis_issue_fetching"),
            cache: false,
            preventDuplicates: true,
            onAdd: $.proxy(this._onIssueChanged,this),
            onDelete: $.proxy(this._onIssueChanged,this)
    });
    // Hide the Issue Line
    $("#zmantis_issue_line").hide();

    /** Assign Input **/
    this.mantisHumans = new Array();
    this.ifHumans = new DwtInputField({parent:this.pNoteDialog, size:70});
    this.ifHumans.getInputElement().setAttribute("id", "zmantis_hinput");
    document.getElementById("zmantis_humans").appendChild(this.ifHumans.getInputElement());
    // Tokenize Input Field
    $("#zmantis_hinput").tokenInput(this.mantisHumans, {
            tokenLimit:1,
            hintText: this.getMessage("zmantis_human_sug"),
            noResultsText: this.getMessage("zmantis_human_nores"),
            searchingText: this.getMessage("zmantis_human_fetching"),
            cache: false,
            preventDuplicates: true
    });
    // Hide the Human Line
    $("#zmantis_human_line").hide();
    
    /** Category Input **/
    this.mantisCategories = new Array();
    this.ifCategory = new DwtInputField({parent:this.pNoteDialog, size:70});
    this.ifCategory.getInputElement().setAttribute("id", "zmantis_cinput");
    document.getElementById("zmantis_category").appendChild(this.ifCategory.getInputElement());
    // Tokenize Input Field
    $("#zmantis_cinput").tokenInput(this.mantisCategories, {
            tokenLimit:1,
            hintText: this.getMessage("zmantis_category_sug"),
            noResultsText: this.getMessage("zmantis_category_nores"),
            searchingText: this.getMessage("zmantis_category_fetching"),
            cache: false,
            preventDuplicates: true
    });
    // Hide the Human Line
    $("#zmantis_category_line").hide();


    /** Title Input **/
    this.ifTitle = new DwtInputField({parent:this.pNoteDialog});
    this.ifTitle.getInputElement().setAttribute("id", "zmantis_tinput");
    document.getElementById("zmantis_title").appendChild(this.ifTitle.getInputElement());
    this.ifTitle.setValue(this.msg.subject);

    var _innertext = ''
    // Append to the note data the data from senders and destination
    for (var i in this.msg._addrs){
        if (this.msg._addrs[i].size() > 0){
                _innertext += '\n'+ i + ': '+ this.msg._addrs[i].toString();
            }
    }

    /** For Zimbra 7 or less */
    if (msg.getTextPart !== undefined ){
        if (msg.isHtmlMail()){
            var div = document.createElement("div");
            div.innerHTML = msg.getBodyContent();
            body = AjxStringUtil.convertHtml2Text(div);
        } else { 
              body = msg.getTextPart();
        }
    } else {
    /** For Zimbra 8 **/
       var body = "";
       if (msg.isHtmlMail()){
            body = AjxStringUtil.convertHtml2Text(msg.getBodyPart(ZmMimeTable.TEXT_HTML).getContent());
       } else {
            body = msg.getTextBodyPart().getContent();      
       }
    }

    _innertext += '\n\n'+this.msg.subject + '\n\n' + body;

    this.dwtext = new DwtHtmlEditor({parent: this.pNoteDialog, content:_innertext});
    if (appCtxt.getShell()._currWinSize.y < 700) {
    	this.dwtext.setSize(550,160); 
    } else {
    	this.dwtext.setSize(550,258); 
    }
    document.getElementById('zmantis_note').appendChild(this.dwtext.getHtmlElement());

    /*** Fill the Attachments Tab ***/
    var attAr =  msg.attachments;

    // Delete duplicates (Zimbra bug with some files)
    var attAr2 = [];
    for (var z = 0; z < attAr.length; z++){
            var found = false;
            for (var z2 = 0; z2 < attAr2.length; z2++){
                     if (attAr2[z2].part === attAr[z].part) found = true;
            }
            if (!found) attAr2.push(attAr[z]);
    }
    attAr = attAr2;

    // Create a Checkbox for each attachment
    var ulHTML = [];
    for(var k = 0;k<attAr.length;k++) {
        if (!attAr[k].filename) continue; // Prevent inline attachments...
            ulHTML.push('<li><label><input type="checkbox" checked="true" part="'+attAr[k].part+'" s="'+attAr[k].s+'" id="'+attAr[k].part+attAr[k].s+'" type="'+attAr[k].ct+'" filename="'+attAr[k].filename+'"/>'+attAr[k].filename+'</label></li>');
        }
    document.getElementById("zmantis_atts").innerHTML = ulHTML.join("");


    // Link The Standard Buttons
    this.pNoteDialog.setButtonListener(DwtDialog.DISMISS_BUTTON, new AjxListener(this, this._cancelDialog));
    this.pNoteDialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._createData),msg);
    
    this.pNoteDialog.popup();
}

/***
 * com_irontec_zmantisH.prototype._cancelDialog
 * 
 * Callback Function for Dismiss Dialog Button.
 * Clear necesary data 
 */
com_irontec_zmantisH.prototype._cancelDialog = function() {
        this.pNoteDialog.popdown();                // Hide the Dialog
        this.pNoteView.clearContent();
}

com_irontec_zmantisH.prototype._onIssueChanged = function() {
    // If An issue has been setted
    if ( $("#zmantis_iinput").val() != ""){
        $("#zmantis_human_line").hide();
        $("#zmantis_category_line").hide();
        $("#zmantis_title").hide();
    }else{
        $("#zmantis_human_line").show();
        $("#zmantis_category_line").show();
        $("#zmantis_title").show();
    }
}

/**
 * com_irontec_zmantisH.prototype._fillUserProjects
 *
 * Fill Project Input with retrieved data from Mantis
 * Also hide Project Loading and show Project Input Box
 * FIXME I'm not sure why we store projects in Map and ArrayFormat
 *       But I wont remove this structures until I recode Issue/Note
 *       creation process
 */
com_irontec_zmantisH.prototype._fillUserProjects = function(_mProjects){
    // Initialize project map
    this.mapProjects = new Map();

    //Serialize u to map
    try{
        for (var i=0;i < _mProjects.length;i++) {
            this._addProject(new Project(_mProjects[i]));
        }
    }catch(e){}

    // Hide Loading before fetching projects
    $("#zmantis_proj_load").hide();
    // Show Project input
    $("#zmantis_project").show();
}

/**
 * com_irontec_zmantisH.prototype._addProject 
 *
 * Adds a Project to the mantispProjects Array.
 * This function is useful to recursive import of projects and their
 * subprojects.
 * FIXME It seems that we only get two projects tiers. This means that
 *       Subprojects of subprojects wont be shown in Input box :(
 */
com_irontec_zmantisH.prototype._addProject = function( project){

    // Create an element for dialog listbox
    var _project    = new Object();
    _project.id     = project.getId();
    _project.name   = project.getName();
    this.mantisProjects.push(_project);

    // Store the actual Project object in our projects Map
    this.mapProjects.put(project.getId(), project);

    // In case of subprojects, populate the array with those, also
    for (var j=0;j< project.subprojects.length; j++) {
        this._addProject(new Project(project.subprojects[j]));
    }
}

/***
 * com_irontec_zmantisH.prototype._getProjectIssues
 *
 * This is the Project change event handler.
 * If project has change, it must be set or cleared.
 * If project has been set, then hide and clear Issues and Humans data
 * that have only sense with a Project. Otherwise, query Mantis for that
 * Project Issues and Humans.
 *
 * FIXME It seems Access Levels doen't nothing to do with Project itself, so
 *       it could be queried at the same time that projects. No need to query
 *       again and again in each project change..
 *
 */
 com_irontec_zmantisH.prototype._getProjectIssues = function(){
 
    /** Attention please: Project field has changed*/
    // Clear previous Issues
    $("#zmantis_iinput").tokenInput("clear");
    $("#zmantis_hinput").tokenInput("clear");
    $("#zmantis_cinput").tokenInput("clear");

    // Hide the Issue input
    $("#zmantis_issueid").hide(); 
    $("#zmantis_humans").hide();
    $("#zmantis_category").hide();
    
    // If user has entered a project ID
    if ( $("#zmantis_pinput").val() != ""){
        // Show Issues Loading
        $("#zmantis_issue_load").show();
        $("#zmantis_human_load").show();
        $("#zmantis_category_load").show();

        // Show the issue line
        $("#zmantis_issue_line").show();
        $("#zmantis_human_line").show();
        $("#zmantis_category_line").show();

        // Get Issues for selected project
        this.ironmantis.getProjectIssues($("#zmantis_pinput").val(), $.proxy(this._fillProjectIssues,this));
        // Get Humans Access Levels for selected project then fill Humnans selector
        this.ironmantis.getProjectHumans($("#zmantis_pinput").val(), this.minAccessLevel, $.proxy(this._fillProjectHumans,this));
        // Get Categories for selected project 
        this.ironmantis.getProjectCategories($("#zmantis_pinput").val(), $.proxy(this._fillProjectCategories, this));
    }else{
        // Hide the Issue Line
        $("#zmantis_issue_line").hide();
        $("#zmantis_human_line").hide();
        $("#zmantis_category_line").hide();
    }
 }

/**
 * com_irontec_zmantisH.prototype._fillProjectIssues
 *
 * This function acts as callback for getProjectIssues. It fills Issues Input
 * with retrieved issues from mantis for the current project.
 * 
 * FIXME: As for Projects, I'm not sure why we store projects in a Map object
 *        Maybe we need more data than I suppose for Note/Issue creation..
 *        It worths a recheck after recoding the zimlet.
 */
com_irontec_zmantisH.prototype._fillProjectIssues = function(issues){
    // Init Mantis Issues 
    this.mantisIssues.length = 0;

    var issueMap = new Map();
    for (var i=0;i< issues.length;i++){
        //Status >= 80 mean issue closed or solved
        var temp =new Issue(issues[i]);
        if (issues[i].status < 80)
            issueMap.put(issues[i].id, temp);
    }
    // Store Issues for selected project
    this.mapIssues = issueMap;
    var values = this.mapIssues.listKeys();
    // Add to Input field
    for (var i in values){
        var _issue = new Object();
        _issue.id   = this.mapIssues.get(values[i]).getId();
        _issue.name = '#'+ this._pad(this.mapIssues.get(values[i]).getId(),7) + " - " + this.mapIssues.get(values[i]).getSummary().substr(0,45);
        if ( this.mapIssues.get(values[i]).getSummary().length > 45 ) _issue.name += "...";
        this.mantisIssues.push(_issue);
    }

    // Hide Loader 
    $("#zmantis_issue_load").hide();
    // Show List
    $("#zmantis_issueid").show();
}


/**
 * com_irontec_zmantisH.prototype._fillProjectCategories
 *
 * This function acts as callback for getProjectCategories. It fills Categories Input
 * with retrieved issues from mantis for the current project.
 * 
 * FIXME: As for Projects, I'm not sure why we store projects in a Map object
 *        Maybe we need more data than I suppose for Note/Issue creation..
 *        It worths a recheck after recoding the zimlet.
 */
com_irontec_zmantisH.prototype._fillProjectCategories = function(categories){
    // Init Mantis Categories 
    this.mantisCategories.length = 0;

    //FIXME Categories are not Objects...
    var categoriesMap = new Map();
    for (var i=0;i< categories.length;i++){
        var temp = new Category(categories[i]);
        temp.setId(i.toString());
        categoriesMap.put(i.toString(), temp);
    }
    // Store Categoriesfor selected project
    this.mapCategories = categoriesMap;
    var values = this.mapCategories.listKeys();
    // Add to Input field
    for (var i in values){
        var _category = new Object();
        _category.id   = this.mapCategories.get(values[i]).getId();
        _category.name = " "+this.mapCategories.get(values[i]).getName();
        this.mantisCategories.push(_category);
    }

    // Hide Loader 
    $("#zmantis_category_load").hide();
    // Show List
    $("#zmantis_category").show();
}


/***
 * com_irontec_zmantisH.changeAccessLevel
 * 
 * This function gets the _projectId, and fires the SOAP call to get the users available
*/
com_irontec_zmantisH.prototype._fillProjectHumans = function(humans){

    // Init Humans Objects
    this.mantisHumans.length = 0;

    this.mapHumans = new Map();
    for (var i=0;i< humans.length;i++){
        var temp =  new AccountData(humans[i]);
        this.mapHumans.put(temp.getId(), temp);
        /* Set current User data. This one will create the Note/Issue later */
        if (temp.getName() == this.getUserPropertyInfo("my_zmantis_username").value)
            this._currentUserAccountData = temp;
    }

    var values = this.mapHumans.listKeys();
    for (var i in values){
        var _human = new Object();
        _human.id   = this.mapHumans.get(values[i]).getId();
        if (this.mapHumans.get(values[i]).getRealName() !== undefined)
            _human.name = " "+this.mapHumans.get(values[i]).getRealName();
        else
            _human.name = " "+this.mapHumans.get(values[i]).getName();
        this.mantisHumans.push(_human);
    }

    // Hide Loader 
    $("#zmantis_human_load").hide();
    // Show List
    $("#zmantis_humans").show();

}


com_irontec_zmantisH.prototype._createData = function(){
   /** Validate all the shit, then decide if you want Issue or Note **/
   if ($("#zmantis_pinput").val().length == 0){
        var _dialog = appCtxt.getMsgDialog();   // returns DwtMessageDialog
        var msg = this.getMessage("zmantis_must_project");
        _dialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
        _dialog.popup();
        return;
   }

   /** Are we trying to create a new Issue? **/
   if ($("#zmantis_iinput").val().length == 0){
        // If creating a issue, category is a MUST
        if ($("#zmantis_cinput").val().length == 0){
                var _dialog = appCtxt.getMsgDialog();   // returns DwtMessageDialog
                var msg = this.getMessage("zmantis_must_category");
                _dialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
                _dialog.popup();
                return;
        }else{
                // Everything ready for Issue creation
                this._createIssueData();
        }
   }else{
        // We're adding new data to a existing issue
        this._createNoteData();
   }
}

com_irontec_zmantisH.prototype._createNoteData = function(){

    this._currentIssueId = $("#zmantis_iinput").val();
    var temp = new Object();
    temp.reporter = this._currentUserAccountData;
    temp.text = this._escapeSOAP(this.dwtext.getContent());
    var noteData = new NoteData(temp);
    this.ironmantis.createNote(this._currentIssueId, noteData, $.proxy(this._onNoteCreated, this));
    // Get Selected attachments (To be later processed)
    this._preProcessAttachments();
    // Close Dialog
    this._cancelDialog();
}

com_irontec_zmantisH.prototype._onNoteCreated = function ( noteID ){
    if ( noteID instanceof Error){
        appCtxt.getAppController().setStatusMsg(this.getMessage("zmantis_errorInsertingEmail"));
        return;
    }

    noteID = this._pad(noteID,7);
    // Show an awesome Message
    appCtxt.getAppController().setStatusMsg(this.getMessage("zmantis_notedatacreated")+" <a href='"+this.getUserPropertyInfo('my_zmantis_url').value+"/view.php?id="+this._currentIssueId+"#c"+noteID+"' target='_blank'>"+  noteID + "</a><br/><small>"+this.getMessage("zmantis_name")+" "+this.getMessage("zmantis_version")+"</small>");
    // Tag email as exported (if requested)
    var tagname = this.getUserPropertyInfo("my_zmantis_tag").value;
    if ( tagname != "" )
            this.tag(this.msg,tagname) ;

    // Also Process Attachments
    this._processAttachments(this._currentIssueId);

}

com_irontec_zmantisH.prototype._createIssueData = function(){

    //Aquí construímos el objeto temporal
    var temp = new Object();
    temp.project = this.mapProjects.get($("#zmantis_pinput").val());
    temp.reporter = this._currentUserAccountData;
    temp.handler = this.mapHumans.get($("#zmantis_hinput").val());
    temp.summary = this.ifTitle.getValue(); 
    temp.description = this._escapeSOAP(this.dwtext.getContent());
    temp.category = this.mapCategories.get($("#zmantis_cinput").val()).getName();

    var issue = new IssueData(temp);

    this.ironmantis.createIssue(issue, $.proxy(this._onIssueCreated,this));
    // Get Selected attachments (To be later processed)
    this._preProcessAttachments();
    // Close Dialog
    this._cancelDialog();
}

com_irontec_zmantisH.prototype._onIssueCreated = function(issueID){
    if ( issueID instanceof Error){
        appCtxt.getAppController().setStatusMsg(this.getMessage("zmantis_errorInsertingEmail"));
        return;
    }

    issueID = this._pad(issueID, 7);
    appCtxt.getAppController().setStatusMsg(this.getMessage("zmantis_issuecreated")+" <a href='"+this.getUserPropertyInfo('my_zmantis_url').value+"/view.php?id="+issueID+"' target='_blank'>"+issueID + "</a><br/><small>"+this.getMessage("zmantis_name")+" "+this.getMessage("zmantis_version")+"</small>");

    // Tag email as exported (if requested)
    var tagname = this.getUserPropertyInfo("my_zmantis_tag").value;
    if ( tagname != "" )
            this.tag(this.msg,tagname) ;
    
    // Also Process Attachments
    this._processAttachments(issueID);

}
com_irontec_zmantisH.prototype._preProcessAttachments = function(){
    var atts = document.getElementById("zmantis_atts").getElementsByTagName("input");

    var port = Number(location.port);
    var baseURL =
    [       location.protocol,
            '//',
            location.hostname,
            (
             (port && ((proto == ZmSetting.PROTO_HTTP && port != ZmSetting.HTTP_DEFAULT_PORT)
            || (proto == ZmSetting.PROTO_HTTPS && port != ZmSetting.HTTPS_DEFAULT_PORT)))?
                    ":"+port:''),
            "/service/home/~/"
    ].join("");

    this._attTotal = 0;
    this._attOk = 0;
    this._attError = 0;
    this._toDoAttachments = {};
    for (var i=0;i<atts.length;i++) {
            if (!atts[i].checked) continue;
            this._attTotal++;
            var attLink = baseURL + atts[i].getAttribute("filename") + "?id="+this.msg.id + "&part=" + atts[i].getAttribute("part");
            this._toDoAttachments[atts[i].getAttribute("part")] = {
                    filename: atts[i].getAttribute("filename"),
                    link : attLink,
                    type : atts[i].getAttribute("ct"),
                    size : atts[i].getAttribute("s")
            };

    }
}

com_irontec_zmantisH.prototype._processAttachments = function(issueID){

    // Process attachments
    if ( this._attTotal > 0){
            for(var part in this._toDoAttachments) {
                    this.attproc = true;
                    // Link Attachment to Issue
                    // IssueID, Filename, FileType, Content(Link) 
                    this.ironmantis.setAttachment(issueID, this._toDoAttachments[part].filename, 
                                                  this._toDoAttachments[part].type, this._toDoAttachments[part].link, $.proxy(this._onAttachmentProcessed, this));
            }
    }
    
}

com_irontec_zmantisH.prototype._onAttachmentProcessed = function(response){
    // Check errors
    if ( response instanceof Error )
        this._attError++;
    else
        this._attOk++;

    // If we have processed all attachments
    if ( (this._attError + this._attOk ) == this._attTotal ){
        if ( this._attOk > 0 )
            appCtxt.getAppController().setStatusMsg(this.getMessage("zmantis_att_done")+" "+this._attOk+"/"+this._attTotal); //FIXME Processing Attachments, please wait
        else
            appCtxt.getAppController().setStatusMsg(this.getMessage("zmantis_errorAttachingFile"));
    }

}

com_irontec_zmantisH.prototype._escapeSOAP = function(text){
    return text;
}

com_irontec_zmantisH.prototype._pad = function (number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
   
    return str;

}
