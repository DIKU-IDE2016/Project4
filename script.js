// Read the hands.csv file
d3.text("hands.csv", function(text) {
    // parse its rows
    var data = d3.csv.parseRows(text);
    // This array will have an array for each of the hand
    var handCoordinates = [];

    // Loop over the data
    for (var i = 0; i < data.length; i++) {
        var xy = [];
        var element = data[i]; // this is coordinates for one hand
        var yBeginning = element.length / 2; //find where y coordinates begin
        // Loop over and push inside xy the element pairs
        for (var j = 0; j < yBeginning; j++) {
            xy.push([+element[j], + element[yBeginning + j]]);
        };

        handCoordinates.push(xy);
    }

    const dim = {w: 500, h: 500 };
    const margins = {top: 20, right: 20, bottom: 50, left: 100};
    
    // ***************************************************************
    // *** HAND DRAWING  *********************************************
    // ***************************************************************

    //Scales
    var x = d3.scale.linear().range([0, dim.w]);
    x.domain([d3.min(handCoordinates, function (row) {
        return d3.min(row, function (coord) {
            return coord[0];
        });
    }), d3.max(handCoordinates, function (row) {
        return d3.max(row, function (coord) {
            return coord[0];
        });
    })]);
    var y = d3.scale.linear().range([dim.h, 0]);
    y.domain([d3.min(handCoordinates, function (row) {
        return d3.min(row, function (coord) {
            return coord[1];
        });
    }), d3.max(handCoordinates, function (row) {
        return d3.max(row, function (coord) {
            return coord[1];
        });
    })]);

    //Line generator
    var line = d3.svg.line().x(function (d) {
        return x(d[0]);
    }).y(function (d) {
        return y(d[1]);
    }).interpolate('cardinal');

    //Create svg element
    var svg = d3.select("#handplot")
        .append("svg")
        .attr("width", dim.w + margins.left + margins.right)
        .attr("height", dim.h + margins.top + margins.bottom)
        .append("g").attr("transform", "translate(" + margins.left + ", " + margins.top + ")");

    // Define axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // Append the axis to the SVG
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dim.h + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

   // Append axis labels
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", dim.w-5)
        .attr("y", dim.h-5)
        .text("Position X");

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 15)
        .attr("x", -5)
        .attr("transform", "rotate(-90)")
        .text("Position Y");

    var handDrawing = svg.append('g');

    // Function to change the current hand
    drawHand = function(index) {

        var path = handDrawing.selectAll('path').data([handCoordinates[index]]);
        
        path.enter().append('path');

        path.transition().attr("d", line);

        path.exit().remove();

        var coordinates = handDrawing.data(handCoordinates[index]);

        coordinates.transition().attr('cx', function (d) {
            return x(d[0]);
        }).attr('cy', function (d) {
            return y(d[1]);
        });
    };
    // By default, draw the first hand
    drawHand(0);

    // ***************************************************************
    // *** PCA DRAWING  **********************************************
    // ***************************************************************

    d3.text("hands_pca.csv", function(text){
        // parse CSV
        var data = d3.csv.parseRows(text);
        var pcaCoordinates = [];

        // Loop over the data and take 1st column as X and second as Y
        for (var i = 0; i < data.length; i++) {
            var element = data[i];
            pcaCoordinates.push([element[0], element[1]]);
        };
    
        // Define the scales
        var x = d3.scale.linear().range([0, dim.w]);
        x.domain([
            d3.min(pcaCoordinates, function(d) { return +d[0]; }),
            d3.max(pcaCoordinates, function(d) { return +d[0]; })
            ]);
        
        var y = d3.scale.linear().range([dim.h, 0]);
        y.domain([
            d3.min(pcaCoordinates, function(d) { return +d[1]; }),
            d3.max(pcaCoordinates, function(d) { return +d[1]; })
            ]);

        // Define the axis
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        // Add the SVG element
        var svg = d3.select("#pcaplot")
        .append("svg")
        .attr("width",dim.w +margins.left + margins.right)
        .attr("height",dim.h + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        // Append the axis
        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dim.h + ")")
        .call(xAxis);
        
        svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

        // Append axis labels
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", dim.w-5)
            .attr("y", dim.h-5)
            .text("PCA 1");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 15)
            .attr("x", -5)
            .attr("transform", "rotate(-90)")
            .text("PCA 2");

        // Define the div for the tooltip
        var div = d3.select("body").append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0);

        // append all the lines
        svg.append('g')
            .selectAll("circle")
            .data(pcaCoordinates)
            .enter()
            .append("circle")
            .attr("cx",function(d){
                return x(d[0]);
            })
            .attr("cy",function(d){
                return y(d[1]);
            })
            .attr("r",10)
            .on('mouseover', function(d, i){
                d3.selectAll('circle')
                .classed('mouseover', false);

                d3.select(this)
                .classed('mouseover', true);
                //Change hands
                drawHand(i);
                
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div.html("Index: " + i)  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");    
            })
            .on('mouseout', function(d){
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);   
            });
    });
});