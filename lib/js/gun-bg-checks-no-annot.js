google.load("visualization", "1", {packages:["corechart"]}); //load the google chart api we need
dates.shift(); //ditto
google.setOnLoadCallback(draw_chart); //once it's loaded, call the function draw_chart
/*
dropdown_built: flag to build the dropdown only on initial load
chart: variable for our chart object. needs to be global so we
can just add new data and redraw, which allows animation
index: index of the rows of data and the places; e.g., 0 = National, 1 = Alabama, etc.
*/

var dropdown_built = false, chart,index = 0,
    months = ['January','February','March', 'April', 'May','June','July','August','September','October','November','December'];
function draw_chart(){
    dropdown_built || build_dropdown(); //build the dropdown if it isn't already built
    var place_data = data[index].slice(1,data[index].length); //grab the data based on the index see index.html for how this gets changed.

//    var ticks = Math.floor(place_data.length/2); //we want our ticks on the x-axis at the ends and the middle
/*
    this_data is an array we'll use to store our data formatted like the api wants it:
    an array of arrays, where the arrays are x and y for this particular point on the line,
    which in this case is month and number of permits
*/
    var this_data = []; 
    /* a DataTable is an object that's part of the google api, essentially to hold the column names/types
       and the row data
    */
    var data_table = new google.visualization.DataTable();
    //add the columns
    data_table.addColumn('string','Month');
    data_table.addColumn('number','Permits');
//    data_table.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});

//    data_table.addColumn({type:'string',role:'annotation'}); // annotation col.
    /*  We're using jQuery's each utility to cycle over each of the items it dates,
        which is an array of the Month-Years from your spreadsheet. This in the file
        lib/js/dates-places.js. i is the index of each item as we cycle over it and date
        is the actual value, which is the "date". Because there are the same number of dates
        as pieces of data for each place, we can use the same index to reference that particular
        piece of data: e.g., date[0]'s data point is place_data[0], date[1] is place_date[1], etc.
        we create an array from date and the data point and add it into the holder array.
    */
    jQuery.each(dates, function(i,date) {
//        this_data.push([format_date(date),{v:place_data[i],f:place_data[i].formatNumber(0,",")},annotations[date] || null]);
//        this_data.push([format_date(date),{v:place_data[i],f:place_data[i].formatNumber(0,",")},tooltip(format_date(date),place_data[i].formatNumber(0,","))]);
        this_data.push([format_date(date),{v:place_data[i],f:place_data[i].formatNumber(0,",")}]);
    });
    //This commented out line will be used later for annotations
    //use google's addRows function to, well, add the rows of data we just built
    data_table.addRows(this_data);
    //these are options for formatting the graph and are part of the api
    var options = {
//      title: places[index] + ' background checks', //build the title based on the index and the places variable (dates-places.js);
      width: '100%',
//      tooltip: { isHtml: true },
      legend: {position: 'none'},
      animation:{ //animate when the graph data changes
            duration: 500, //make the animation last 500 milliseconds (half-sec)s
            easing: 'out' //this makes it go fast then slightly slower at the end
      },
      curveType: 'function', //this draws the line between points as curves, rather than straight lines
      vAxis: {minValue: 0, textStyle: {color: '#666', fontSize: 10}},
//      hAxis: { showTextEvery: ticks, textStyle: {color: '#666', fontSize: 10}, gridlines: {color: '#000'} },
      hAxis: {textPosition: 'none'},
      chartArea:{ left:70,top:30,width:"80%",height:"90%"}
    };
    
    if(!chart) { //make a new chart object if we haven't already
        chart = new google.visualization.ComboChart(document.getElementById('dfm-graph')); //put it in this div (index.html)
    }
    chart.draw(data_table, options);


}
function draw_annotations(){
    console.log('adding annotation');
    jQuery('#dfm-graph-container').append('<div id="dfm-annotation"></div>');
}

function tooltip(the_date,the_number) {
    return '<div class="dfm-tooltip" style="z-index:10000 !important; padding: 3px;">' + the_date + '<br />permits: ' + the_number + '</div>';

}

//function to build the dropdown

function build_dropdown() {
    var options = ''; //holder all the <option>Place name</option>'s we're gonna build
    jQuery.each(places, function(i,place) { //for each of the places ...
        options += '<option>' + place + '</option>'; // ... add an option ...
    });
    jQuery('#dfm-select').html(options); // ... then use jQuery to put it inside the <select> tags in index.html
    dropdown_built = true; //set our flag from false to true
}

function format_date(date) {
    var date_pieces = date.split('-');
    if(parseInt(date_pieces[1]) < 15) {
        date_pieces[1] = '20' + date_pieces[1];
    }
    else {
        date_pieces[1] = '19' + date_pieces[1];
    }
    var real_date = new Date(date_pieces.join(' 1, '));
    return [months[ real_date.getMonth()], date_pieces[1]].join(' ');

}

Number.prototype.formatNumber = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "," : d,
        t = t == undefined ? "." : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + d : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + d) + (c ? t + Math.abs(n - i).toFixed(c).slice(2) : "");
};
