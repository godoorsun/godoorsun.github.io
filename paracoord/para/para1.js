var showNULL = false,
    nullValues = {},
    minValues = {},
    maxValues = {},
    ranges = {};
(function () {
	var dataObj = {},
	    currentData = {},
	    pc0 = null,
	    currentResult = "",
	    selectValue={},//store the current value of all select components
	    sourceNum;
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
		sourceNum = (Object.keys(ds[0]).length - 1) / 3;//compute number of data column
    	
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
    	function parse() {//orgnize data in dataObj
    		
    		ds.forEach(function (d, i) {
    			var name,
    	            data = dataObj,
    		        dataArr = [],
    		        cData = {},
    		        j = 1;
	    	    for(j = 1; j <= sourceNum; j++) {
	    	    	name = d["name" + j];
	    	    	if(data[name]) {
	    	    		data = data[name];
	    	    	} else {
	    	    		data = data[name] = {};
	    	    	}
	    	    }
	    	    if(data["data"]) {
	    	    	dataArr = data["data"];
	    	    } else {
	    	    	dataArr = data["data"] = [];
	    	    }
	    	    //data["flowers"] = [];
	    	    cData = dataArr[dataArr.length] = {};
	    	    
	    	    for(j = 1; j <= sourceNum; j++){
	    	    	name = d["name" + j];
	    	    	cData["min " + name] = +d["min" + j];
	    	    	cData["max " + name] = +d["max" + j];
	    	    	cData[name] = 1.0 * (cData["min " + name] + cData["max " + name]) / 2;
	    	    }
	    	    cData["p"] = +d["p"];
    				
    	    });
    	}
    	filterDataExceedRange();
    	parse();
	}
	function setComponents() {//set the options of result select to be result names
		var slideValueFormat = d3.format(".2f");
		
		function setResultSelectOption() {
			//compute and add options for result select component
			var ops = [],
			    resultName = "";
			ops.push("");
			for(resultName in dataObj) {
				ops.push(resultName);
			}
			d3.select("#result")
			  .selectAll('option')
			  .data(ops)
			  .enter()
			  .append("option")
			  .attr("value", function (d) {return d;})
			  .text(function (d) {return d;});
			
			d3.select("#result") .on("change", onChangeSelect);
			
		}
		function setReasonSelectsOption() {
			var i = 1;
			for(i = 1; i < sourceNum; i++){//add select component for each reason and set attribute
				
		    	d3.select("#select_div")
		    	  .append("select")
		    	  .attr("id", "reason" + i)
		    	  .on("change", onChangeSelect)
		    	  .append("option")
		    	  .attr("value", "")
		      	  .text("--" + "reason" + i +"--");
		    }
		}
		function setSelectValue() {
			var i = 1;
			selectValue["result"] = "";//initialize the value of result select
			for(i = 1; i < sourceNum; i++){ 
				selectValue["reason" + i] = "";
			}
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
		function onChangeSelect() {//listenter for all select component
			var id = this.id,//get the id for select component
	            reasonIndex = 0,//index of the reason select compnent
	            value = "",
	            i = 1,
	            options= [];
			selectValue[id] = this.value;//store the current value of the select
			if(id == "result") {//if the select is result select, store the value to result
				currentResult =  this.value;
			} else {//if the select is a reason select, get the index of the reason select
				reasonIndex = +id.substring(6);
			}
			
			//get data about current select values
			currentData = dataObj[selectValue["result"]];
			for(i = 1; i <= reasonIndex; i++) {
				currentData = currentData[selectValue["reason" + i]];
			}
			if(reasonIndex < (sourceNum - 1)){//current select is not the last reason select
				options = [];
				d3.select("#reason"+(reasonIndex + 1))//remove the old options of next reason select
				  .selectAll("option")
				  .remove();
				
				//add new options to the next reason select
				d3.select("#reason" + (reasonIndex + 1))
				  .append("option")
				  .attr("value", "")
				  .text("--reason" + (reasonIndex + 1) + "--");
				for(value in currentData){
					options.push(value);
				}
				d3.select("#reason" + (reasonIndex+1))
				  .selectAll("option")
				  .data(options)
				  .enter()
				  .append("option")
				  .attr("value", function (d) {return d;})
				  .text(function (d) {return d;});
				//remove options of the select component after the next select
				for(i = reasonIndex + 2 ; i < sourceNum; i++){
					d3.select("#reason" + i)
					  .selectAll("option")
					  .remove();
					d3.select("#reason" + i)
					  .append("option")
					  .attr("value", "")
					  .text("--reason" + i + "--");
				}
			}else{//if the current select is the last reasson select, change the parallel coordinate
				//get data about current select values
				currentData = dataObj[selectValue["result"]];
				for(i = 1; i <= reasonIndex; i++) {
					currentData = currentData[selectValue["reason" + i]];
				}
				currentData = currentData["data"];
				resetPC0();
			}	
		}
		setResultSelectOption();
		setReasonSelectsOption();
		setSelectValue();
		setBundleRangeComponent();
		setSmoothnessRangeComponent();
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
	        imageWidth = 8;
		function computeTraits() {
			var i = 1;
			for(i = 1; i < sourceNum; i++) {//add current values of reason select components to dimensions
				traits.push(selectValue["reason" + i]);
			}
			traits.push(selectValue["result"]);//add current value of result select component to dimensions
		}
		function computeYScales() {
			tickValuesObj = {};
			d3.select("#example0").append('svg')
			   .attr("width", 300)
			   .attr("height", 800);
			
			traits.forEach(function (d, i) {//compute yscale of all reasons and current result
				var domain = [],//domain of yscale
			        range = [];//range of yscale
//			        notNull = [];
//				notNull = currentData.filter(function (p) {//filter null value and compute the max value of the dimension
//					return p["max " + d] <= ranges[d][1];
//				});
				var min = d3.min(currentData, function (p) {
					return p["min " + d];
				});
				var max = d3.max(currentData, function (p) {
					return p["max " + d];
				});
				domain = [minValues[d], min, max, maxValues[d]];
//				range = [h, 9 * h / 10, h / 10, 0];
				range = [h, h - h1, h1, 0];
				y[d] = d3.scale.linear()//set the yscale of each dimension
	               .domain(domain)
	               .range(range);
				tickValuesObj[d] = computeTickValues(range, domain);
//			    var domain = [],//domain of yscale
//			        range = [],//range of yscale
//			        min,
//			        max;
//			    
//			    //compute domain and range of yscale
//				min = d3.min(currentData, function (p) {
//					return p["min " + d];
//				});
//						  
//				domain.push(ranges[d][0]);
//				range.push(h);
//				max = d3.max(currentData, function (p) {
//				    return p["max " + d];
//				});
//							  
//				if(min > ranges[d][0]) {
//					domain.push(min);
//					range.push(9 * h / 10);
//				}
//					
//				if(max > min && max < ranges[d][1]) {
//					domain.push(max);
//					range.push(h / 10);
//				}
//				domain.push(ranges[d][1]);
//				range.push(0);
//				
//				//set the yscale
//				y[d] = d3.scale.linear()
//				               .domain(domain)
//				               .range(range);
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
		
			pc0.tickValues(function (d) {
				return tickValuesObj[d];
			});
		
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
			pc0.svg.selectAll(".dimension")
			   .append("svg:image")
			   .attr("x", 1)
		 	   .attr("y", h1)
		 	   .attr("width", imageWidth)
		 	   .attr("height", h - 2 * h1)
		 	   .attr("xlink:href",function (d) {return "p1/p3/" + currentResult+"." + d + ".jpg";});
		};
		function setBar() {//append the green bar which is look like "I" to the axis
			pc0.svg.selectAll(".dimension")
			   .append("svg:g")
			   .attr("class", "bar")
			   .each(function (d) {
				    var domain=[],//ranges of value
				        y1,//the coordinate of lower line
				        y2;//the coordinate of upper line
					domain = [d3.min(currentData, function (p) {return p["min " + d];}),
			    			  d3.max(currentData, function (p) {return p["max " + d];})
		    		];
					
					y1 = y[d](domain[0]);
					y2 = y[d](domain[1]);
					//console.log(y1);
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