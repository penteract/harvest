"use strict";

let animating = false
function redraw(depth){
    if(depth===undefined) depth=cursor.depth;
    cursor = map
    while(cursor.depth < depth){
        cursor = cursor.getChildren()[pLocation[cursor.depth+1] ]
    }
    zoomout.disabled = cursor.depth<=minDepth;
    zoomin.disabled = cursor.depth>=11;
    gamecanvas.width |=0;
    numseeds.innerHTML = seeds+""
    cursor.draw(ctx);
}


function zoomOut(){
    redraw(cursor.depth-1)
}
function zoomIn(){
    //console.log(cursor,cursor.depth)
    
    let start = undefined
    let step = function(timestamp){
        if (start === undefined) {
            start = timestamp;
        }
        let t = timestamp - start
        console.log(t)
        if(t<100){
            cursor.drawZoomed(t/100, ctx)
            window.requestAnimationFrame(step)
        }
        else {
            redraw(cursor.depth+1)
        }

    }
    window.requestAnimationFrame(step)
    redraw()
}

function click(e){
    console.log(e)
    let loc = cursor.getLocation(e.x,e.y)
    if (loc!==undefined){
        pLocation[cursor.depth+1] = loc
        zoomIn
    }
}
function paste(){
    map = map.clone()
    let c = map
    while(c.depth+1 < cursor.depth){
        c = c.getChildren()[pLocation[c.depth+1] ]
    }
    c.getChildren()
    c.children[pLocation[c.depth+1]] = saves[c.depth+1]
    //cursor = c.getChildren()[pLocation[c.depth+1] ]
    redraw()
}
function wait(){
    map = map.wait()
    redraw()
}
function harvest(){
    
}