var showNULL = false,
    nullValues = {},
    minValues = {},
    maxValues = {},
    ranges = {};
//    minValues = 
(function () {
	var resultNames = [],
	    reasonNames = [],
	    dataObj = {},
	    currentData = {},
	    pc0 = null,
	    currentResult = "";
	var tickValuesObj = {};  
	d3.csv('data/ranges.csv', function (rs) {//get ranges for each data source
	    rs.forEach(function (d) {
	        ranges[d["name"]] = [+d["min"], +d["max"]];
	        maxValues[d["name"]] = +d["max"] + 1;
	        nullValues[d["name"]] = +d["max"] + 2;
	        minValues[d["name"]] = +d["min"] - 1;
	        
	    });
	    
	    d3.csv('data/result3.csv', function (ds) {
	    	
	    	parseData(ds);
	    	setComponents();
//	    	setPC0();
	    });
	});
	function parseData(ds) {
		var sourceNum = (Object.keys(ds[0]).length - 1) / 3;//compute number of data column
    	
    	//filter the data that exceed the ranges of value
    	function filterDataExceedRange() {
    		var i = 1,
		        name = "",
		        temp = [],
		        index = 0;
    		ds.forEach(function (p, j) {
    			for(i = 1; i <= sourceNum; i++) {
	    		    name = p["name" + i];
	    			if(+p["min" + i] < ranges[name][0] || +p["min" + i] > ranges[name][1] || +p["max" + i] < ranges[name][0] || +p["max" + i] > ranges[name][1]) {
	    			    return;
	    			}
	    		}
	    		temp[index++] = p;	
	    	});
	    	ds = temp;
    	}
    	
    	//scan the whole data and compute result name and reason name
    	function getResultsAndReasonsName() {
    		var resultsTemp = [],
    	        reasonsTemp = [],
    	        i = 2,
    	        value = "";
    	        
    		ds.forEach(function (d) {
	            resultsTemp[d["name1"]] = 1;
	    		for(i = 2; i <= sourceNum; i++) {
	    		    reasonsTemp[d["name"+i]] = 1;
	    		}
	    	});
	    	for(value in resultsTemp) {
	    		resultNames.push(value);
	    	}
	    	for(value in reasonsTemp) {
	    		reasonNames.push(value);
	    	}
    	}
    	function parse() {//orgnize data in dataObj
    		
    		resultNames.forEach(function (d, i) {
    			dataObj[d] = {};
    			dataObj[d]["data"] = [];
    		});
    		ds.forEach(function (d, i) { 
    		    var resultName = d["name1"],
    		        reasonName = "",
    		        len = dataObj[resultName]["data"].length,
    		        data = dataObj[resultName]["data"][len] = {},
    		        j = 2;
    				
    			//set each values of all dimensions to be its null value
    			reasonNames.forEach(function (d, i) {
    			    data["min "+d] = nullValues[d];
    		        data["max "+d] = nullValues[d];
    			});
    			reasonNames.forEach(function (d, i) {
    			    data[d] = nullValues[d];
    			});
    			
    			//modity the values of dimensions related to current row of file 
    			data["min " + resultName] = +d["min1"];
    			data["max " + resultName] = +d["max1"];
    			data[resultName] = 1.0 * (data["min " + resultName] + data["max " + resultName]) / 2;
    			data["p"] = +d["p"];
    			for(j = 2; j <= sourceNum; j++) {
    			    reasonName = d["name" + j];
    				data["min " + reasonName] = +d["min" + j];
    				data["max " + reasonName] = +d["max" + j];
    				data[reasonName] = 1.0 * (data["min " + reasonName] + data["max " + reasonName]) / 2;
    			}
    				
    	    });
    	}
    	filterDataExceedRange();
    	getResultsAndReasonsName();
    	parse();
	}
	function setComponents() {//set the options of result select to be result names
		var slideValueFormat = d3.format(".2f");
		
		function setResultSelectOption() {
			var ops = [];
			ops.push("");
			resultNames.forEach(function (d) {
				ops.push(d);
			});
			d3.select("#result")
			  .selectAll('option')
			  .data(ops)
			  .enter()
			  .append("option")
			  .attr("value", function (d) {return d;})
			  .text(function (d) {return d;});
			d3.select("#result") .on("change", function () {
				    currentResult = this.value;
					currentData = dataObj[currentResult]["data"];//get Data about current result
					resetPC0();//generate parallel coordinates
			});
			
		}
		
		function setCheckBox() {
			d3.select("#checkbox_div")
			  .selectAll("input")
			  .data(reasonNames)
			  .enter()
			  .append("label")
			  .text(function(d) { return d;})
			  .append("input")
			  .attr("checked", true)
			  .attr("type", "checkbox")
			  .on("change", function () {
				  resetPC0();
			  });
		}
		function setBundleRangeComponent() {
			d3.select("#bundling").on("change", function () {//register listener for smoothness slide
				d3.select("#strength").text(slideValueFormat(+this.value));
				pc0.bundlingStrength(this.value).render();
			});
		}
		function setSmoothnessRangeComponent() {
			d3.select("#smoothness").on("change", function () {//register listener for smoothness slide
			    d3.select("#smooth").text(slideValueFormat(+this.value));
				pc0.smoothness(this.value).render();
			});
		}
		function setNULLCheckbox() {
    		d3.select("#null_checkbox")//register listener for showNULL checkbox
    		  .on("change", function () {
    			  showNULL = !showNULL;
    			  resetPC0();
    		  });
    	}
		setResultSelectOption();
		setCheckBox();
		setBundleRangeComponent();
		setSmoothnessRangeComponent();
		setNULLCheckbox();
	}
	
	function resetPC0() {//render parallel coordinates
	    //compute dimensions of parcoords
		var bundleDimensionValue = $("#bundling").val(),//the value of bundling slide
			smoothnessValue = $("#smoothness").val(),//the value of smoothness slide
			types = {},//data types of dimensions
			traits = [],
			y = {},
			lineColorScale = d3.scale.linear()//compute scale of path opacity
	        					.domain(d3.extent(currentData, function (d) {return d["p"];}))
	        					.range([0.2, 1]),
	        m = [80, 80, 200, 80],
	        w = window.innerWidth - m[1] - m[3],
	        h = 800 - m[0] - m[2],
	        h1 = 30,
//	        h2 = 20,
	        imageWidth = 8;
		function computeTraits() {
			traits = [];//set the traits to empty
			
			d3.select("#checkbox_div")//add the checked dimensions to traits
			  .selectAll("input")
			  .each(function (d) {
			      if (this.checked) {
			    	  traits.push(d);
			      }
			  });
			
			traits.push(currentResult);//add selected result to traits
			
		}
		function computeYScales() {
			tickValuesObj = {};
			d3.select("#example0").append('svg')
			   .attr("width", 300)
			   .attr("height", 800);
			
			traits.forEach(function (d, i) {//compute yscale of all reasons and current result
			    var domain = [],//domain of yscale
			        range = [],//range of yscale
			        notNull = [];
				notNull = currentData.filter(function (p) {//filter null value and compute the max value of the dimension
					return p["max " + d] <= ranges[d][1];
				});
				//!!! notNull.length 可能等于0
				var min = d3.min(notNull, function (p) {
					return p["min " + d];
				});
				var max = d3.max(notNull, function (p) {
					return p["max " + d];
				});
				if(min == undefined) {
					min = max = ranges[d][0];
				}
				domain = [minValues[d], min, max, maxValues[d], nullValues[d]];
//				range = [h, h1 + 9 * (h - h1) / 10, h1 + (h - h1) / 10, h1, 0];
				range = [h, h - h1, 2 * h1, h1, 0];
				y[d] = d3.scale.linear()//set the yscale of each dimension
	               .domain(domain)
	               .range(range);
				
//			        min,
//			        max;
//			    var tickRange = []
//                    tickDomain = [];
//			    
//				notNull = currentData.filter(function (p) {//filter null value and compute the max value of the dimension
//					return p["max " + d] <= ranges[d][1];
//				});
//				
//				min = d3.min(currentData, function (p) {//compute the min value of the dimension
//					return p["min " + d];
//				});
//				
//				//compute the domain and ranges for each axis scale
//				domain.push(ranges[d][0]);
//				range.push(h);
//				
//				tickDomain[0] = ranges[d][0];
//				tickRange[0] = h;
//				
//				if(notNull.length != 0) {
//				    max = d3.max(notNull, function (p) {
//				    	return p["max " + d];
//				    });
//							  
//					if(min > ranges[d][0]) {
//						tickDomain[0] = min;
//						tickRange[0] = h1 + 9 * (h - h1) / 10;
//					    domain.push(min);
//						range.push(h1 + 9 * (h - h1) / 10);
//					}
//					
//					if(max > min) {
//						tickDomain[1] = max;
//						tickRange[1] = h1 + (h - h1) / 10;
//						
//						domain.push(max);
//						range.push(h1 + (h - h1) / 10);
//					}
//				}
//				domain.push(ranges[d][1]);
//				range.push(h1);
//				if(tickDomain[1] == undefined) {
//					tickDomain[1] = ranges[d][1];
//					tickRange[1] = h1;
//				}
//				domain.push(nullValues[d]);
//				range.push(0);
				    	   
//				y[d] = d3.scale.linear()//set the yscale of each dimension
//				               .domain(domain)
//				               .range(range);
				tickValuesObj[d] = computeTickValues(range, domain);
				
	        });
			d3.select("#example0").select('svg').remove();
		}
		function computeTickValues(range, domain) {
			var scale = d3.scale.linear()
			                .domain([domain[1], domain[2]])
			                .range([range[1], range[2]]);
			var axis = d3.svg.axis()
		    .scale(scale)
		    .orient("left")
		    .ticks(10);
			var tickValues = [];
			var k = 0;
			d3.select('svg').call(axis).selectAll(".tick").each(function(data) {
				tickValues[k++] = data;
			});
			tickValues[0] = domain[1];
			tickValues[tickValues.length - 1] = domain[2];
//			if(d[1] != tickValues[tickValues.length - 1]) {
//				tickValues[k++] = d[1];
//			}
//			if(d[0] != tickValues[0]) {
//				tickValues = [d[0]].concat(tickValues);
//			}
			tickValues = [domain[0]].concat(tickValues).concat([domain[3]]);
			return tickValues;
		}
		function computeTypesForPC0() {
			//instruct types of dimensions,set all to be number
			traits.forEach(function (d, i) {
			    types[d] = "number";
				types["max " + d] = "number";
				types["min " + d] = "number";
			});
			types["p"] = "number";
		}
		
		function clearPC0() {//clear previous parcoords
			
			if(pc0 != null) {
			    d3.selectAll("svg")
			      .remove();
			    d3.selectAll("canvas")
			      .remove();
			}

	        pc0 = null;
		}
		//function
		function render() {
			var tip = d3.tip()//for axis label tip
						.attr('class', 'd3-tip')
						.offset([-10, 0])
						.html(function (d) {
						    return d;
						});
			pc0 = d3.parcoords()("#example0")
				.margin({
				     top: m[0],
					 left: m[1],
					 right: m[3],
					 bottom: m[2]
				})
				.dimensions(traits)
				.data(currentData)
				.color(function (d) {
					return "rgba(0,102,153," + lineColorScale(d["p"]) + ")";
				});
			pc0.types(types);
		
			traits.forEach(function (d, i) {//compute yscale of axis
				pc0.yscale[d] = y[d];
			});
//			pc0.tickSize(20);
//			pc0.tickValues(function (d) {
//			    var ticks = y[d].domain();
//				ticks = ticks.slice(0, ticks.length-1);
//				return ticks;
//			});
			pc0.tickValues(function (d) {
				return tickValuesObj[d];
			});
//			pc0.tickFormat(function (d, i) {
////				return tickValuesObj[d];
//				console.log();
//			});
		
			pc0.smoothness(smoothnessValue)
				.bundlingStrength(bundleDimensionValue)
				.bundleDimension(currentResult)
				.showControlPoints(false);
		
			pc0.mode("queue")
				.render();
			pc0.brushMode("1D-axes")
				.reorderable()
				.interactive();
				
			pc0.svg.call(tip);//bind tip to the svg
			
			pc0.svg.selectAll(".label")//rigister tip for the labels above the axises
			   .text(function (d) {return d.split(" ")[d.split(" ").length-1].substring(0, 5)+".";})
			   .on('mouseover', tip.show)
			   .on('mouseout', tip.hide);
				
			if(showNULL) {//set to show the "NULL" text in the axis
			    pc0.svg.selectAll(".dimension")
					   .append("svg:text")
				  	   .attr("text-anchor", "middle")
				  	   .attr("x", -20)
				  	   .attr("y", 5)
				  	   .text("NULL");
	        }
				
			pc0.svg
				.selectAll("text")
				.style("font", "10px sans-serif");
				
			pc0.svg
				.selectAll(".extent")
				.attr("stroke", d3.rgb('orange'))
				.attr("stroke-width", 2);
		
			setBundleDimension();
			setImage();
			setBar();
				
			pc0.on("brush", onbrush);
		}
		function setBundleDimension() {//change the options of bundleDimension select component
			var select = d3.select("#bundleDimension");
			
			select.selectAll('option')//remove old options
		          .remove();
			
			select.selectAll('option')//add new options
				  .data(traits)
				  .enter()
				  .append("option")
				  .attr("value", function (d) {return d;})
				  .text(function (d) {return d;});
			
			select.on("change", function () {
				pc0.bundleDimension(this.value);
			});//register listenter for change
		};
		function setImage() {//append image to axis which is already compoted
//		    pc0.svg.selectAll(".dimension")
//				   .append("svg:image")
//				   .attr("x", 1)
//			 	   .attr("y", h1 + (h - h1) / 10)
//			 	   .attr("width", imageWidth)
//			 	   .attr("height", 8 * (h - h1) / 10)
//			 	   .attr("xlink:href",function (d) {
//			 		   return "p/p3/" + currentResult+"." + d + ".jpg";
//			 		   });
			pc0.svg.selectAll(".dimension")
			   .append("svg:image")
			   .attr("x", 1)
		 	   .attr("y", h1)
		 	   .attr("width", imageWidth)
		 	   .attr("height", h - 3 * h1)
		 	   .attr("xlink:href",function (d) {
		 		   return "p/p3/" + currentResult+"." + d + ".jpg";
		 		   });
//		    console.log("p/p3/" + currentResult+"." + d + ".jpg");
		};
		function setBar() {//append the green bar which is look like "I" to the axis
			pc0.svg.selectAll(".dimension")
				   .append("svg:g")
				   .attr("class", "bar")
				   .each(function (d) {
					    var domain=[],//ranges of value
					        y1,//the coordinate of lower line
					        y2;//the coordinate of upper line
						if(currentData.filter(function (p) { return p["max " + d] <= ranges[d][1];}).length == 0) {
				    		  domain = [nullValues[d],nullValues[d]];
				    	} else {
				    		  domain = [d3.min(currentData, function (p) {return p["min " + d];}),
				    			        d3.max(currentData.filter(function (p) {return p["max " + d] <= ranges[d][1];}), function (p) {return p["max " + d];})
			    			  ];
				    	}
						
						y1 = y[d](domain[0]);
						y2 = y[d](domain[1]);

	                    d3.select(this)//set the position of up and bottom horizontal line
						  .selectAll(".lineh")
						  .data([y1, y2])
						  .enter()
						  .append("svg:line")
						  .attr("class","lineh")
						  .attr("x1",-10)
						  .attr("x2",0)
						  .attr("y1",function (p) {return p;})
						  .attr("y2",function (p) {return p;});
						  
						d3.select(this)//set the position of vertical line
						  .append("svg:line")
						  .attr("class", "linev")
						  .attr("x1", -5)
						  .attr("x2", -5)
						  .attr("y1", y1)
						  .attr("y2", y2);
					});
	    };
	    function onbrush(fg) {//listener of brush event, change position and opacity based on the exent of the data selected
		    d3.selectAll(".bar")
		      .each(function (d, i) {
		    	   var y1,
		    	       y2;
			       if(fg.length != 0) {//if any value is selected
				       var fgNotnull = fg.filter(function (p) {//filter nullValue
				    	   return p[d] < nullValues[d];
				       });
					   
					   if(fgNotnull.length != 0) {//if there are values that not equals nullValue,compute value range
					       y1 = d3.min(fgNotnull, function(p){return p["min " + d];});//minValue
						   y2 = d3.max(fgNotnull, function(p){return p["max " + d];});//maxValue
					   } else {
						   y1 = y2 = nullValues[d];
					   }
					   
					   d3.select(this)//set the position of horizontal line
					     .selectAll(".lineh")
					     .data([y1, y2])
					     .attr("y1",function (p) {return y[d](p);})
					     .attr("y2",function (p) {return y[d](p);})
					     .attr("opacity",1);
					   
					   d3.select(this)//set the posion of vertical line
					     .selectAll(".linev")
					     .attr("y1", y[d](y1))
					     .attr("y2", y[d](y2))
					     .attr("opacity", 1);
					   
				   } else {//if no value of this axis is selected,set the opacity of "I" to 0 to make it hide
				       d3.select(this)
				         .selectAll(".lineh")
				         .attr("opacity", 0);
				       
					   d3.select(this)
					     .selectAll(".linev")
					     .attr("opacity", 0);
				   }
			   });
	    }
	    clearPC0();
	    computeTraits();
	    computeYScales();
	    computeTypesForPC0();
	    render();
	}
	function setPC0() {
		resetPC0();
	}
}());