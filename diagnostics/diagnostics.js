var db_table = document.getElementById("db_table");
var table_dropdown = document.getElementById("tables");
var execution_heading = document.getElementById('execution_panel_heading');
var execution_dropdown = document.getElementById("execution_dropdown");
var execution_panel_body = document.getElementById("execution_panel_body");
var execution_warning = null;
var execution_panel_go_button = null;
var timer = null;
var current_show_table = null;
var current_show_table_header = null;
var current_show_table_body = null;
var execution_type = null;
var column_edit = document.getElementById('column_to_edit');
var row_edit = document.getElementById('row_selection');
var row_key_for_edit = null;

// Functions for main table
function getLocalCellValue(col, row){
    return current_show_table_body[row][col];
}


function setCrtShowTable(tableName){
    current_show_table = tableName;
}


function tableAutoUpdater(){
    ajaxGetDbTable();
    if (timer != null){
        clearInterval(timer);
    }
    timer = setInterval(ajaxGetDbTable, 1000);
}

function ajaxGetDbTable(){
    var xmlhttpShow = new XMLHttpRequest();
    xmlhttpShow.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200){          
                updateTable(this.responseText);
        }
    }
    if (current_show_table != null){
        xmlhttpShow.open('GET', `getDbTable.php?q=${current_show_table}`, true);
        xmlhttpShow.send();
    }
}

function tableMaker(head_data, body_data){
    var i, j;

    //create table header
    var html_msg = "<thead>";
    html_msg += "<tr>";
    for(i of head_data){
        html_msg += ("<th scope=\"col\">" + i + "</th>");
    }
    html_msg += "</tr>";
    html_msg += "</thead>";

    //create table body
    html_msg += "<tbody>";
    for (i of body_data){
        html_msg += "<tr>";
        for(j of i){
            html_msg += ("<td>" + j + "</td>");
        }
        html_msg += "</tr>";
    }
    html_msg += "</tbody>";

    return html_msg;

}

function updateTable(result){
    var data = JSON.parse(result);

    // save header and body for other functions
    current_show_table_header = data['header'];
    current_show_table_body = data['body'];

    // make the table
    db_table.innerHTML = tableMaker(data['header'], data['body']);
}

// Functions for table dropdown menu
function ajaxTableDropdown(callback){
    var xmlhttpShow = new XMLHttpRequest();
    xmlhttpShow.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200){
            if (typeof callback === 'function')
                callback(this.responseText);
        }
    }
    xmlhttpShow.open('GET', 'getTableName.php?q=null', true);
    xmlhttpShow.send();
}

function updateTableDropdown(result){
    var dropdown_msg = "<option value=\"null\"></option>";
    var item; 
    var array = JSON.parse(result);
    for(item of array){
        dropdown_msg += "<option value=" + "\'" + item + "\'" + ">" + item + "</option>";
    }
    table_dropdown.innerHTML = dropdown_msg;
}

function displayExecutionDropdown(option){
    if (option != 'null'){
        var execution_formgroup_msg = "<label for=\"execution_dropdown\" class=\"control-label col-sm-4\">Execution:</label>";
        execution_formgroup_msg += "<div class=\"col-sm-8\">";
        execution_formgroup_msg += "<select class=\"form-control\" id=\"execution_dropdown\" name=\"execution_dropdown\">";
        execution_formgroup_msg += "<option value=\"null\"></option>";
        execution_formgroup_msg += "<option value=\"1\">Add a row</option>";
        execution_formgroup_msg += "<option value=\"2\">Delete a row</option>";
        execution_formgroup_msg += "<option value=\"3\">Update a cell value</option>";
        execution_formgroup_msg += "</select>";
        execution_formgroup_msg += "</div>";

        // execution dropdown only appears when table is selected
        document.getElementById("execution_formgroup").innerHTML = execution_formgroup_msg;
        execution_dropdown = document.getElementById("execution_dropdown");
        execution_dropdown.addEventListener("change", function(){executionPanelUpdater(execution_dropdown.value)}, false);
    }
    else{
        document.getElementById("execution_formgroup").innerHTML = ""; 
        execution_heading.innerHTML = "Execution";      
    }
    execution_panel_body.innerHTML = "";
    
}

// Functions for displaying Execution dropdown menu
function executionPanelUpdater(option){
    var form_group_msg = "";

    // configure inputs
    switch (option){
        case "1":
            // add a new row
            execution_type = 'add';
            execution_heading.innerHTML = "Execution - add a new row";
            form_group_msg += addRowExecution(current_show_table_header);
            break;
        case "2":
            // delete a row
            execution_type = 'delete';
            execution_heading.innerHTML = "Execution - delete an existing row";
            form_group_msg += removeRowExecution();
            break;
        case "3":
            // update a cell value
            execution_type = 'update';
            execution_heading.innerHTML = "Execution - edit a cell value";
            form_group_msg += editCellColumnExecution();
            break;
        default:
            execution_panel_body.innerHTML = "";
            execution_heading.innerHTML = "Execution";
            break;
    }

    // add warning space
    form_group_msg += "<div class='form-group'>";
    form_group_msg += "<div class='col-sm-offset-2'>";
    form_group_msg += "<p id='execution_warning' style='color:blue'></p>";
    form_group_msg += "</div>";
    form_group_msg += "</div>";

    // add go button
    form_group_msg += "<div class='form-group'>";
    form_group_msg += "<div class='col-sm-offset-9'>";
    form_group_msg += "<input id=\"go\" src=\"../images/go_normal.png\" type=\"image\"/>";
    form_group_msg += "</div>";
    form_group_msg += "</div>";

    //add warning and go button
    execution_panel_body.innerHTML = form_group_msg;

    execution_warning = document.getElementById("execution_warning");
    execution_panel_go_button = document.getElementById("go");
    execution_panel_go_button.addEventListener('click', function(){ajaxExecDB(), stopFormSubmit(event)}, false);
    column_edit = document.getElementById('column_to_edit');
    column_edit.addEventListener('change', ajaxShowSingleValueDB, false);
    row_edit = document.getElementById('row_selection');
    row_edit.addEventListener('change', ajaxShowSingleValueDB, false);

}

function addRowExecution(header){
    var item;
    var form_group_msg = "";
    for(item of header){
        form_group_msg += "<div class='form-group'>";
        form_group_msg += `<label for="${item}" class="control-label col-sm-4">${item}:</label>`;
        form_group_msg += "<div class='col-sm-8'>";
        if (item == "updated_at")
            form_group_msg += `<input type="datetime-local" class="form-control" id="${item}" name="${item}">`;
        else
            form_group_msg += `<input type="text" class="form-control" id="${item}" name="${item}">`;
        form_group_msg += "</div>";
        form_group_msg += "</div>";
    }

    return form_group_msg;
    
}

function removeRowExecution(){
    var select_key;
    var key_index;
    var item;
    var form_group_msg = "";

    // determine the key to select a row
    select_key = rowSelectKey();
    
    // create form group message
    form_group_msg += "<div class='form-group'>";
    form_group_msg += `<label for=\"row_selection\" class=\"control-label col-sm-4\">Row(${select_key}):</label>`;
    form_group_msg += "<div class=\"col-sm-8\">";
    form_group_msg += "<select class=\"form-control\" id=\"row_selection\" name=\"row_selection\">";
    form_group_msg += "<option value=\"null\"></option>"

    key_index = current_show_table_header.indexOf(select_key);
    for (item of current_show_table_body){
        form_group_msg += `<option value=\"${item[key_index]}\">${item[key_index]}</option>`;
    }
    form_group_msg += "</select>";
    form_group_msg += "</div>";
    form_group_msg += "</div>";
    
    return form_group_msg;
}

function editCellColumnExecution(){
    var item;
    var key_index, select_key;
    var form_group_msg = "";

    //create column dropdown
    form_group_msg += "<div class='form-group'>";
    form_group_msg += `<label for=\"column_to_edit\" class=\"control-label col-sm-4\">Column:</label>`;
    form_group_msg += "<div class=\"col-sm-8\">";
    form_group_msg += "<select class=\"form-control\" id=\"column_to_edit\" name=\"column_to_edit\">";
    form_group_msg += "<option value=\"null\"></option>"
    for(item of current_show_table_header){
        form_group_msg += `<option value=\"${item}\">${item}</option>`;
    }
    form_group_msg += "</select>";
    form_group_msg += "</div>";
    form_group_msg += "</div>";

    //create row dropdown
    // determine the key to select a row
    select_key = rowSelectKey();
    key_index = current_show_table_header.indexOf(select_key);
    row_key_for_edit = select_key;

    form_group_msg += "<div class='form-group'>";
    form_group_msg += `<label for=\"row_selection\" class=\"control-label col-sm-4\">Row(${select_key}):</label>`;
    form_group_msg += "<div class=\"col-sm-8\">";
    form_group_msg += "<select class=\"form-control\" id=\"row_selection\" name=\"row_selection\">";
    form_group_msg += "<option value=\"null\"></option>"

    for (item of current_show_table_body){
        form_group_msg += `<option value=\"${item[key_index]}\">${item[key_index]}</option>`;
    }
    form_group_msg += "</select>";
    form_group_msg += "</div>";
    form_group_msg += "</div>";

    //create new input field
    form_group_msg += "<div class='form-group'>";
    form_group_msg += `<label for="new_value" class="control-label col-sm-4">New value:</label>`;
    form_group_msg += "<div class='col-sm-8'>";
    if (item == "updated_at" || item == "arrivalTime")
        form_group_msg += `<input type="datetime-local" class="form-control" id="new_value" name="new_value">`;
    else
        form_group_msg += `<input type="text" class="form-control" id="new_value" name="new_value">`;
    form_group_msg += "</div>";
    form_group_msg += "</div>";

    return form_group_msg;

}

// Function for send out execution values to backend
function ajaxExecDB(){
    var data_string;

    var xmlhttpShow = new XMLHttpRequest();
    xmlhttpShow.onreadystatechange = async function () {
        if (this.readyState == 4 && this.status == 200) {
            // reset drop down menus 
            if (execution_type == 'update'){
                // need to wait 1 second to get the lastest table
                await sleep(1000);
                executionPanelUpdater('3');
                execution_warning.innerHTML = this.responseText;
            }
            else if (execution_type == 'delete'){
                // need to wait 1 second to get the lastest table
                await sleep(1000);
                executionPanelUpdater('2');
            }
            
        }
    }
    // send to different backend file for different execution type
    if (execution_type == 'add'){
        data_string = JSON.stringify(getExecutionAddRowValues());
        xmlhttpShow.open('GET', `addDbRow.php?q=${data_string}`, true);
    }
    else if (execution_type == 'delete'){
        data_string = JSON.stringify(getExecutionDeleteRowValue());
        if (data_string == 'null')
            return null;
        xmlhttpShow.open('GET', `rmDbRow.php?q=${data_string}`, true);
    }
    else if (execution_type == 'update'){
        data_string = JSON.stringify(getExecutionEditRowValue());
        if (data_string == 'null')
            return null;
        xmlhttpShow.open('GET', `editSingleCellValue.php?q=${data_string}`, true);
    }
    xmlhttpShow.send();
}

function ajaxShowSingleValueDB(){
    if(column_edit.value == 'null' || row_edit.value == 'null')
        return;

    var data_string = JSON.stringify(getExecutionEditRowValue());

    var xmlhttpShow = new XMLHttpRequest();
    xmlhttpShow.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            execution_warning.innerHTML = "Current Cell Value: " + this.responseText;

        }
    }
    xmlhttpShow.open('GET', `getSingleCellValue.php?q=${data_string}`, true);
    xmlhttpShow.send();
}

function getExecutionAddRowValues(){
    var item;
    var data = {};
    for (item of current_show_table_header){
        data[item] = document.getElementById(item).value;
    }
    data['tableName'] = current_show_table;
    return data;
}

function getExecutionDeleteRowValue(){
    var data = {};
    data['value'] = document.getElementById('row_selection').value;
    if (data['value'] == 'null')
        return null;
    data['tableName'] = current_show_table;
    
    // determine the key to select a row
    data['key'] = rowSelectKey();

    return data;

}

function getExecutionEditRowValue(){
    var data = {};
    data['column'] = column_edit.value;
    data['row'] = row_edit.value;
    if (data['row'] == 'null' || data['column'] == 'null')
        return null;
    data['tableName'] = current_show_table;
    data['row_key'] = row_key_for_edit;
    data['new_value'] = document.getElementById('new_value').value;
    return data;
}

function rowSelectKey(){
    if (current_show_table_header.includes('logID'))
        return 'logID';
    else if (current_show_table_header.includes('nodeID'))
        return 'nodeID';
    else if (current_show_table_header.includes('username'))
        return 'username';
    else
        return current_show_table_header[0];
}

// utility functions
function stopFormSubmit(e){
    e.preventDefault();
    return false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    //source: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
}

document.addEventListener("DOMContentLoaded", function(){ajaxTableDropdown(updateTableDropdown)}, false);
table_dropdown.addEventListener("change", function(){setCrtShowTable(table_dropdown.value), tableAutoUpdater(), displayExecutionDropdown(table_dropdown.value)}, false);

