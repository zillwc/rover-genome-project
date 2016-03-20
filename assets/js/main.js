$(function() {
    showModal();
});

var xhr, response;
var eleClicked = 0;

$('#queryCreatorForm').on('submit', function() {
    var userid = $('#userid').val();
    var startDate = $('#startDate').val();
    var startTime = $('#startTime').val();
    var endDate = $('#endDate').val();
    var endTime = $('#endTime').val();
    var limit = $('#limit').val();
    var offset = $('#offset').val();

    var start = startDate + " " + startTime + ":00";
    var end = endDate + " " + endTime + ":00";
    var hasLimit = false;
    var hasOffset = false;

    if (userid=="" || startDate=="" || endDate=="" || startTime=="" || endTime=="")
        return;

    if (limit != "" && !isNaN(limit))
        hasLimit = true;

    if (offset != "" && !isNaN(offset))
        hasOffset = true;

    var query = "SELECT * FROM lucktastic.api_access_log WHERE userid = '"+userid+"' AND access_time BETWEEN '"+start+"' AND '"+end+"'";

    if (hasLimit)
        query += " LIMIT " + limit;

    if (hasLimit && hasOffset)
        query += " OFFSET " + offset;

    query += ";";

    $('#queryField').val(query);
    $('#queryField').trigger('autoresize');
    $('#queryCreator').closeModal();
    $('#queryField').focus();

    return false;
});


$('#btnRunQuery').on('click', function() {
    if ($(this).hasClass('disabled')) {
        messages = ["Stop it, I'm already running the query", "Stop it", "Stop clicking me", "Query already running!", "Patience is key!"];
        Materialize.toast(messages[eleClicked++ % messages.length], 4000);
        return;
    }

    var query = $('#queryField').val();

    if (query == "") {
        $('#queryField').focus();
        return;
    }

    showLoad();

    window.xhr = $.ajax({
        url: "/query",
        data: {
            "query": query
        },
        dataType: "json",
        success: function(resp) {
            if (!resp.isValid) {
                console.log(resp);
            }

            if (resp.data && resp.data.length == 0) {
                Materialize.toast('No rows returned!', 10000);
                return;
            }

            window.response = resp.data;
            var tableHTML = createHTMLTable(resp.data);
            $('#resultPane').html("");
            $('#resultPane').html(tableHTML).show();
        },
        error: function(xhr, err) {
            console.log(xhr);
        },
        done: function() {
            hideLoad();
        }
    });
});

function createHTMLTable(data) {
    var html = '<table class="highlight">';
    html += "<thead>";
    html += "<tr>";

    console.log(data);

    var headers = [];
    var index = 0;
    for (var i in data[0]) {
        html += "<th>"+i+"</th>";
        headers[index++] = i;
    }

    html += "</tr>";
    html += "</thead>";
    html += "<tbody>";

    for (var i in data) {
        curr = data[i];
        html += "<tr>";
        for (var j in curr) {
            html += "<td>"+ curr[j] +"</td>";
        }
        html += "<tr>";
    }

    html += "</tbody>";
    html += "</table>";

    return html;
}


function showModal() {
    $('#startDate').val(getCurrDate(8));
    $('#startTime').val("05:00");

    $('#endDate').val(getCurrDate());
    $('#endTime').val(getCurrTime());

    $('#queryCreator').openModal();
}

function getCurrTime() {
    var d = new Date();
    var hours = d.getHours().toString().length==1 ? '0' + d.getHours().toString() : d.getHours();
    var mins = d.getMinutes().toString().length==1 ? '0' + d.getMinutes().toString() : d.getMinutes();
    return hours + ':' + mins;
}

function getCurrDate(days) {
    var today = new Date();

    if (days)
        today.setDate(today.getDate() - 8);

    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd<10)
        dd = '0' + dd

    if (mm<10)
        mm = '0' + mm

    return yyyy+'-'+mm+'-'+dd;
}


function showLoad() {
    $('#btnRunQuery').addClass('disabled');
    $('#loading').show();
}

function hideLoad() {
    $('#btnRunQuery').removeClass('disabled');
    $('#loading').hide();
}