/*
Giiven a certain number, calculate the whole tree layout:
    - number of nodes at each level
    - value of each node
    - how many levels (when to stop)
    - calculate the node position based on the node number
    - calculate the line position based on node position
*/

function fullBfs(node) {
    if (input == 0) return;

    var tmp = Math.floor(Math.sqrt(node.value));
    node.children = [];
    for (var i = 1; i <= tmp; i++) {
        var child = {
            'value': node.value - Math.pow(i, 2),
            'parent': node
        };
        node.children.push(child);
    }

    for (var i = 0; i < node.children.length; i++) {
        fullBfs(node.children[i]);
    }
}

function partialBfs(root) {
    var calBfs = function() {
        if (flag == true) return;

        var node = queue.shift();

        var tmp = Math.floor(Math.sqrt(node.value));
        node.children = [];
        for (var i = 1; i <= tmp; i++) {
            var child = {
                'id': 'circle' + id.toString(),
                'value': node.value - Math.pow(i, 2),
                'sqrt': i,
                'parent': node
            };
            id++;
            node.children.push(child);
        }

        for (var i = 0; i < node.children.length; i++) {
            queue.push(node.children[i]);
            if (node.children[i].value == 0) flag = true;
        }

        calBfs();
    }

    var id = 1;
    var flag = false;
    var queue = [];
    queue.push(root);

    calBfs();
}



function layout(nodeList, levelWidth, levelHeight) {
    var calLevelLayout = function(nodeList) {
        var nextLevel = [];

        var span = levelWidth / nodeList.length;
        for (var i = 0; i < nodeList.length; i++) {
            nodeList[i].cx = span / 2 + span * i;
            nodeList[i].cy = (depth + 1) * levelHeight;
            nodeList[i].r = 8;
            if (nodeList[i].children) {
                for (var j = 0; j < nodeList[i].children.length; j++) {
                    nextLevel.push(nodeList[i].children[j]);
                }
            }
        }

        if (nextLevel.length > 0) {
            depth++;
            calLevelLayout(nextLevel);
        } else {
            return;
        }
    }

    var depth = 0;
    calLevelLayout(nodeList);
}


function draw(canvas, root) {
    var mouseOver = function(node) {
        colorList = [];
        var tmpNode = node;
        var tooltipHtml = root.value.toString() + '=' + node.value.toString() + '+';

        while(tmpNode) {
            var circle = d3.select('#' + tmpNode.id);
            var highlightColor = '#ff4000';
            colorList.push(circle.attr('fill'));
            circle.attr('fill', highlightColor)
                .attr('stroke', highlightColor);
            if(tmpNode.parent) {
                d3.select('#' + tmpNode.parent.id + '-' + tmpNode.id)
                    .attr('stroke', highlightColor)
                    .attr('stroke-width', 2);
                tooltipHtml += tmpNode.sqrt.toString() + '<sup>2</sup>' + '+';
            }
            tmpNode = tmpNode.parent;
        }

        var xPosition = d3.event.pageX + 8;
        var yPosition = d3.event.pageY + 12;

        var widthSpace = 150;
        var heightSpace = 100;
        if (xPosition > window.innerWidth - 100) {
            xPosition = d3.event.pageX - widthSpace;
        }

        if (yPosition > window.innerHeight - 50) {
            yPosition = d3.event.pageY - heightSpace;
        }

        d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .style("display", "block")
            .select("#tooltip-text")
            .html(tooltipHtml.substr(0, tooltipHtml.length-1));
    }

    var mouseOut = function(node) {
        var tmpNode = node;
        while(tmpNode) {
            d3.select('#' + tmpNode.id)
                .attr('fill', colorList.shift())
                .attr('stroke', 'black');;
            if(tmpNode.parent) {
                d3.select('#' + tmpNode.parent.id + '-' + tmpNode.id)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1);
            }
            tmpNode = tmpNode.parent;
        }
        d3.select("#tooltip").style("display", "none");
    }


    var drawNode = function() {
        if (queue.length == 0) return;

        var node = queue.shift();

        if (node.parent) {
            d3.select('#' + node.parent.id)
                .attr('fill', 'white');

            canvas.append('line')
                .attr('id', node.parent.id + '-' + node.id)
                .attr('x1', node.cx)
                .attr('y1', node.cy - node.r)
                .attr('x2', node.parent.cx)
                .attr('y2', node.parent.cy + node.parent.r)
                .attr('stroke', 'black')
                .attr('stroke-width', 1);
        }

        canvas.append('circle')
            .attr('id', node.id)
            .attr('cx', node.cx)
            .attr('cy', node.cy)
            .attr('r', node.r)
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('fill', function(){
                return node.value == 0 ? 'orange' : 'lightgreen';   
            })
            .on('mouseover', function(){
                mouseOver(node);
            })
            .on('mouseout', function(){
                mouseOut(node);
            });

        canvas.append('text')
            .attr('x', node.cx - node.r / 3)
            .attr('y', node.cy + node.r / 3)
            .text(node.value.toString())
            .attr('text-anchor', "middle")
            .attr('font-size', 8)
            .on('mouseover', function(){
               mouseOver(node);
            })
            .on('mouseout', function(){
                mouseOut(node);
            });

        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                queue.push(node.children[i]);
            }
        }

        setTimeout(drawNode, 30);
    }

    var queue = [];
    var colorList;
    queue.push(root);
    drawNode();
}

function init() {
    canvasSize = {
        'width': window.innerWidth - 35,
        'height': window.innerHeight
    };

    svgGroup = d3.select('#svg').append('g');
}

function start(value) {
    var treeRoot = {};
    treeRoot.value = value;
    treeRoot.id = 'circle0';
    partialBfs(treeRoot);

    var nodeList = [];
    nodeList.push(treeRoot);
    layout(nodeList, canvasSize.width, 120);

    if (svgGroup) {
        svgGroup.remove();
    }

    svgGroup = d3.select('#svg').append('g');

    draw(svgGroup, treeRoot);
}

var canvasSize;
var svgGroup;
init();







