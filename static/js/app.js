function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`
    
    // Use `.html("") to clear any existing metadata

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    var metaDataLocation = d3.select("#sample-metadata");
    metaDataLocation.html("");

    d3.json(`/metadata/${sample}`).then((metaData) => {
      pairValueList = Object.entries(metaData);
      for (i = 0; i < pairValueList.length; i++ ) {
        pairValue = pairValueList[i]
        metaDataLocation
          .append("p")
          .text(`${pairValue[0]}: ${pairValue[1]}`)
      };
    
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    var level = metaData.WFREQ * 20;

    // Trig to calc meter point
    var degrees = 180 - level, 
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ 
      type: 'scatter',
      x: [0], 
      y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'speed',
      text: level,
      hoverinfo: 'text+name'},
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgb(26, 255, 14)', 
                       'rgb(120, 255, 67)',
                       'rgb(136, 255, 90)',
                       'rgb(160, 255, 125)',
                       'rgb(182, 255, 147)',
                       'rgb(210, 255, 160)',
                       'rgb(220, 255, 191)',
                       'rgb(238, 255, 210)',
                       'rgb(248, 255, 225)',
                       'rgb(255, 255, 255)']},
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: '<b>Belly Button Washing Frequency</b> <br>Scrubs per Week',
      height: 600,
      width: 500,
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout);

    });
}


function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`/samples/${sample}`).then((response) => {
    var otu_ids = response["otu_ids"];
    var sample_values = response["sample_values"];
    var otu_labels = response["otu_labels"];

    var colors = [];
    for (i = 0; i < otu_ids.length; i++ ) {
      if (otu_ids[i] < 100) {
        colors.push('rgb(71, 84, 252)');
      } else if (otu_ids[i] < 200) {
        colors.push('rgb(66, 127, 175)');
      } else if (otu_ids[i] < 500) {
        colors.push('rgb(66, 190, 147)');
      } else if (otu_ids[i] < 1000) {
        colors.push('rgb(66, 220, 132)');
      } else if (otu_ids[i] < 1500) {
        colors.push('rgb(180, 252, 132)');
      } else if (otu_ids[i] < 2500) {
        colors.push('rgb(91, 72, 51)');
      } else {
        colors.push('rgb(92, 65, 27)');
      }
    };

    // @TODO: Build a Bubble Chart using the sample data
    var trace1 = {
      x: otu_ids,
      y: sample_values,
      mode: 'markers',
      marker: {
        size: sample_values,
        color: colors,
      },
      text: otu_labels,
    };

    var data1 = [trace1];

    var layout1 = {
      showlegend: false,
      xaxis : {
        title: 'OTU ID'
      }
    }

    Plotly.newPlot("bubble", data1, layout1);


    // @TODO: Build a Pie Chart
    // making zipped data list
    var zipData = otu_ids.map(function(e, i) {
      return [e, sample_values[i], otu_labels[i]]
    }); 

    // sorting zipData
    zipData.sort(function(a, b) {
      return b[1]-a[1]
    });

    // Slice the first 10 objects for plotting
    zipData = zipData.slice(0, 10);

    console.log(zipData)

    var pieValues = zipData.map(element => element[1]);
    var pieLabels = zipData.map(element => element[0]);
    var pieText = zipData.map(element => element[2]);

    console.log(pieValues);

    var data = [{
      values: pieValues,
      labels: pieLabels,
      hovertext: pieText,
      type: 'pie'
    }];

    var layout = {
      height: 500,
      width: 500
    };

    Plotly.newPlot('pie', data, layout);

    })
  }



function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
