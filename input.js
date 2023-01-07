"use strict";

let animating = false
function redraw(){
    zoomout.disabled = cursor.depth<=minDepth;
    zoomin.disabled = cursor.depth>=11;
    gamecanvas.width |=0;
    numseeds.innerHTML = seeds+""
    cursor.draw(ctx);
}


function zoomOut(){
    cursor = cursor.parent;
    redraw()
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
        if(t<1000){
            cursor.drawZoomed(t/1000, ctx)
            window.requestAnimationFrame(step)
        }
        else {
            cursor = cursor.getChildren()[pLocation[cursor.depth+1]];
            redraw()
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