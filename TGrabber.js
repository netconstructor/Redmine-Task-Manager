
var TGrabber = {

  // ---------------------- Iframes management -----------------------

  setIframe: function(url, onload) {
    if(url.indexOf('?') != -1) {
      url += '&_=' + Math.random();
    } else {
      url += '?_=' + Math.random();  
    }
    var iframe = JHtml.iframe('iframe' + Math.random(), url, onload);
    document.body.appendChild(iframe);

    iframesLoaded[iframesLoaded.length] = iframe.id;
  },
 
  garbageCollectOne: function(obj) {
    var iframes = document.getElementsByTagName('iframe');
    for(var i=0;i<iframes.length;i++) {
      if(iframes[i].id == obj.id)
        document.body.removeChild(iframes[i]);
    }
  },

  garbageCollect: function() {
     var iframes = document.getElementsByTagName('iframe');
     for(var i=0; i<iframes.length; i++) {
       for(var j=0; j<iframesLoaded.length; j++) {
         if(iframesLoaded[j] == iframes[i].id) {
           document.body.removeChild(iframes[i]);
           iframesLoaded[j] = null;
         }
       }
     }
  },

  // --------------------- Worker methods -----------------------------

  grabFilters: function(iframe) {
    var filters = [];
    var content = iframe.contentWindow.document.getElementById('sidebar');
    var afterTitle = false;
    for(var i=0;i<content.childNodes.length;i++) {
      if(content.childNodes[i].tagName == 'H3' && content.childNodes[i].innerHTML == 'Custom queries') {
        afterTitle = true; 
      }
      if(afterTitle && content.childNodes[i].tagName == 'A') {
        filters[filters.length] = [content.childNodes[i].innerHTML, content.childNodes[i].href];
      }
    }
    filtersList = filters;
    TGrabber.garbageCollectOne(iframe);
  },

  waitFilters: function() {
    if(filtersList.length == 0) {
      setTimeout('TGrabber.waitFilters()',1000);
    } else {
      JInterface.start();
    }
  },

  // ------------- Template information --------------------------------

  grabVars: function(iframe, container) {
    var c           = iframe.contentWindow.document;
    var trackers    = c.getElementById(TGrabber.issueTrackerId).getElementsByTagName('option');
    var statuses    = c.getElementById(TGrabber.issueStatusId).getElementsByTagName('option');
    var priorities  = c.getElementById(TGrabber.issuePriorityId).getElementsByTagName('option');
    var categories  = c.getElementById(TGrabber.issueCategoryId).getElementsByTagName('option');
    var versions    = c.getElementById(TGrabber.issueTargetVersion).getElementsByTagName('option');
  
    for(var i=0;i<trackers.length;i++) {
      TTracker.list[i] = [trackers[i].innerHTML, trackers[i].value];  
    }

    for(var i=0;i<categories.length;i++) {
      TCategory.list[i] = [categories[i].innerHTML, categories[i].value];  
    }

    for(var i=0;i<versions.length;i++) {
      TVersion.list[i] = [versions[i].innerHTML, versions[i].value];  
    }
    
    for(var i=0;i<statuses.length;i++) {
      TStatus.list[i] = [statuses[i].innerHTML, statuses[i].value];  
    }

    for(var i=0;i<priorities.length;i++) {
      TPriority.list[i] = [priorities[i].innerHTML, priorities[i].value];  
    }

    $(container).appendChild(SortList.renderAddTask());
  },

  grabListTemplate: function(iframe) {
    var template = [];
    var rows = iframe.contentWindow.document.getElementById('filters').getElementsByTagName('table')[0].getElementsByTagName('table')[0].getElementsByTagName('tr');
    for(var e=0;e<rows.length;e++) {
      if(rows[e].style.display != 'none') {
        var name = rows[e].id.split('tr_')[1];
        var field = iframe.contentWindow.document.getElementById('values_' + name);
        if(field.multiple == true) {
          var value = [];
          for(var i=0; i<field.options.length;i++) {
            if(field.options[i].selected)
              value.push(field.options[i].value)
          }
        } else {
          var value = [field.value];
        }
        template[template.length] = [name, value];
      } 
    }
    for(var s=0; s<listCollection.length();s++) {
      if(iframe.src.indexOf(listCollection.lists[s].url) != -1) {
        listCollection.lists[s].template = template;
      }
    }
  },

  // ------------- Ticket visualization --------------------------------

  grabFullTicket: function(iframe, container) {
    var c               = iframe.contentWindow.document;
    var tracker_id      = c.getElementById(TGrabber.issueTrackerId) ? c.getElementById(TGrabber.issueTrackerId).value : null;
    var status_id       = c.getElementById(TGrabber.issueStatusId) ? c.getElementById(TGrabber.issueStatusId).value : null;
    var subject         = c.getElementById(TGrabber.issueSubject) ? c.getElementById(TGrabber.issueSubject).value : null;
    var description     = c.getElementById(TGrabber.issueDescription) ? c.getElementById(TGrabber.issueDescription).value : null;
    var priority_id     = c.getElementById(TGrabber.issuePriorityId) ? c.getElementById(TGrabber.issuePriorityId).value : null;
    var category_id     = c.getElementById(TGrabber.issueCategoryId) ? c.getElementById(TGrabber.issueCategoryId).value : null;
    var assigned_to     = c.getElementById(TGrabber.issueAssignedTo) ? c.getElementById(TGrabber.issueAssignedTo).value : null; 
    var target_version  = c.getElementById(TGrabber.issueTargetVersion) ? c.getElementById(TGrabber.issueTargetVersion).value : null;
    var start_date      = c.getElementById(TGrabber.issueStartDate) ? c.getElementById(TGrabber.issueStartDate).value : null;
    var due_date        = c.getElementById(TGrabber.issueDueDate) ? c.getElementById(TGrabber.issueDueDate).value : null;
    var hours           = c.getElementById(TGrabber.issueEstimatedHours) ? c.getElementById(TGrabber.issueEstimatedHours).value : null;
    var done_ratio      = c.getElementById(TGrabber.issueDoneRatio) ? c.getElementById(TGrabber.issueDoneRatio).value : null;
    var dificulty       = c.getElementById(TGrabber.issueDificulty) ? c.getElementById(TGrabber.issueDificulty).value : null;

    $(container).innerHTML = '';
    $(container).appendChild(SortList.renderFullTask( {
        trackerId: tracker_id,
        statusId: status_id,
        subject: subject,
        description: description,
        priorityId: priority_id,
        categoryId: category_id,
        assignedTo: assigned_to,
        targetVersion: target_version,
        startDate: start_date,
        dueDate: due_date,
        hours: hours,
        doneRatio: done_ratio,
        dificulty: dificulty
      } ));
  },

  // ------------- Ticket modification ---------------------------------

  issueForm: 'issue-form',
  issueTrackerId: 'issue_tracker_id',
  issueSubject: 'issue_subject',
  issueDescription: 'issue_description',
  issueStatusId: 'issue_status_id',
  issuePriorityId: 'issue_priority_id',
  issueAssignedTo: 'issue_assigned_to_id',
  issueCategoryId: 'issue_category_id',
  issueTargetVersion: 'issue_fixed_version_id',
  issueStartDate: 'issue_start_date',
  issueDueDate: 'issue_due_date',
  issueEstimatedHours: 'issue_estimated_hours',
  issueDoneRatio: 'issue_done_ratio',
  issueDificulty: 'issue_custom_field_values_3',
  issueNotes: 'notes',
  
  addTicketSetValues: function(iframe, status_id, title, tracker, target_version, category, priority,  dificulty, hours, notes) {
    iframe.contentWindow.document.getElementById(TGrabber.issueTrackerId).value = tracker;
    iframe.contentWindow.document.getElementById(TGrabber.issueStatusId).value = status_id;
    iframe.contentWindow.document.getElementById(TGrabber.issueSubject).value = title;
    if(priority) iframe.contentWindow.document.getElementById(TGrabber.issuePriorityId).value = priority;
    if(notes) iframe.contentWindow.document.getElementById(TGrabber.issueDescription).value = notes;
    if(target_version) iframe.contentWindow.document.getElementById(TGrabber.issueTargetVersion).value = target_version;
    if(hours) iframe.contentWindow.document.getElementById(TGrabber.issueEstimatedHours).value = hours;
    if(category) iframe.contentWindow.document.getElementById(TGrabber.issueCategoryId).value = category;
    if(dificulty) iframe.contentWindow.document.getElementById(TGrabber.issueDificulty).value = dificulty;
    
    TGrabber.ticketSubmitUpdates(iframe, true);
  },

  ticketChangeValue: function(iframe, arrayF, reload) {
    for(var i=0; i<arrayF.length;i++) {
      var field = arrayF[i][0];
      var value = arrayF[i][1];
      iframe.contentWindow.document.getElementById(field).value = value;
    }
    TGrabber.ticketSubmitUpdates(iframe, reload);
  },

  ticketSubmitUpdates: function(iframe, reload) {
    if (reload) iframe.setAttribute('onload','SortList.reload()');
    else iframe.setAttribute('onload','');
    iframe.contentWindow.document.getElementById(TGrabber.issueForm).submit();
  },
  
  editTask: function(task, onload) {
    if(sortBaseUrl != '' && sortProject != '') {
      var url = sortBaseUrl + 'issues/' + task;
      TGrabber.setIframe(url, onload);
    } else {
      alert('No base URL setup!');
    }
  },

  createTask: function(tracker, title, target_version, category, priority, dificulty, start_date, due_date, hours, notes) {
    var onload = 'TGrabber.addTicketSetValues(this, 1,"' + title + '",' + tracker + ',' + target_version + ',' + category + ',' + priority + ',1' + ',' + hours + ',"' + notes + '")';

    if(sortBaseUrl != '' && sortProject != '') {
      var url = sortBaseUrl + sortProject + 'issues/new';
      TGrabber.setIframe(url, onload);
    } else {
      alert('No base URL setup!');
    }
  },

  // ------------- Getters --------------------------------------------

  getListsTemplate: function() {
    for(var i=0;i<listCollection.length();i++) {
      TGrabber.setIframe(listCollection.lists[i].url, "TGrabber.grabListTemplate(this)"); 
    }
  }, 

  getEnvironmentVars: function(container) {
    if(sortBaseUrl != '' && sortProject != '') {
      var url = sortBaseUrl + sortProject + 'issues/new';
      TGrabber.setIframe(url, "TGrabber.grabVars(this, '" + container + "')");
    } else {
      alert('No base URL setup!');
    }
  },

  splitTaskId: function(url) {
    var sp = url.split('/');
    var taskId = sp[sp.length - 1];
    return taskId;
  },
   
  getFullTask: function(taskId, container) {
    if(sortBaseUrl != '' && sortProject != '') {
      var url = sortBaseUrl + 'issues/' + taskId;
      TGrabber.setIframe(url, "TGrabber.grabFullTicket(this, '" + container + "')");
    } else {
      alert('No base URL setup!');
    }

  },


  getTasks: function(url, onload) {
    TGrabber.setIframe(url, onload);
  },

  getFilters: function() {
    if(sortBaseUrl != '' && sortProject != '') {
      var url = sortBaseUrl + sortProject + 'issues';
      TGrabber.setIframe(url, "TGrabber.grabFilters(this)");
      TGrabber.waitFilters();
    } else {
      alert('No base URL setup!');
    }
  }
};

