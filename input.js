"use strict";
var cursors = new Array(12);
let animating = false

var hints = [
    "Plant something",
    "Zoom out to look at the plot",
    "See what happens when plants grow",
    "Collect them",
    "You can click to zoom in on other plants",
    "Spread the plants out to improve growth rate",
    "Record a whole plot to speed up planting next time",
    "Save up to buy another plot",
    "Save up to buy another plot",
    "Plants don't grow as well in rocky soil "
]

const costFactor = 0.3;
const expandCosts = {}// cost to reach depth n
expandCosts[10] = costFactor*PLOTSZ*PLOTSZ;
expandCosts[9] = expandCosts[10]*FARMSZ*FARMSZ;
expandCosts[8] = expandCosts[9]*REGSZ*REGSZ;
expandCosts[7] = expandCosts[8]*6;
const expandNames = {}
expandNames[10] = "Buy Plot"
expandNames[9] = "Buy Farm"
expandNames[8] = "Go over the edge of the world"
expandNames[7] = "Build a rocket"

function redraw(depth){
    if(depth===undefined) depth=cursor.depth;
    cursor = map
    while(cursor.depth < depth){
        cursors[cursor.depth] = cursor;
        cursor = cursor.getChildren()[pLocation[cursor.depth+1] ]
    }
    cursors[cursor.depth] = cursor;
    copybut.disabled = cursor.depth>=11;
    zoomoutbut.disabled = cursor.depth<=minDepth;
    zoominbut.disabled = cursor.depth>=11;
    pastebut.disabled = saves[cursor.depth]===undefined || seeds<saves[cursor.depth].countPlants(cursor)
    pastebut.innerHTML = saves[cursor.depth]===undefined?"Plant":"Plant ("+saves[cursor.depth].countPlants(cursor)+")"
    harvestbut.disabled = cursor.countPlants()==0n
    expandbut.disabled = seeds < expandCosts[nextUnlockDepth]
    expandbut.innerHTML = expandNames[nextUnlockDepth]+" ("+expandCosts[nextUnlockDepth]+")"
    gamecanvas.width |= 0;
    numseeds.innerHTML = seeds+""
    hint.innerHTML = "Hint: "+hints[tutorial]
    cursor.draw(ctx);
}

function skipTutorial(){
    tutorial+=8
    waitbut.style.visibility="visible"
    copybut.style.visibility="visible"
    zoomoutbut.style.visibility="visible"
    harvestbut.style.visibility="visible"
    zoominbut.style.visibility="visible"
    expandbut.style.visibility="visible"
    seeds+=1000n

}

var atime = 200

function zoomOut(){
    if(animating) return;
    if (tutorial==1){
        tutorial+=1
        waitbut.style.visibility="visible"
    }
    if (tutorial==5 && cursor.countPlants()>0){
        tutorial+=1
        copybut.style.visibility="visible"
    }
    animating=true
    let start = undefined
    let step = function(timestamp){
        if (start === undefined) {
            start = timestamp;
        }
        let t = timestamp - start
        if(t<atime){
            gamecanvas.width |= 0;
            cursor.drawZoomed(1-t/atime, ctx)
            window.requestAnimationFrame(step)
        }
        else {
            animating=false
            redraw()
        }
    }
    window.requestAnimationFrame(step)
    redraw(cursor.depth-1)
}
function zoomIn(){
    if(animating) return;
    //console.log(cursor,cursor.depth)
    animating=true;
    let start = undefined
    let step = function(timestamp){
        if (start === undefined) {
            start = timestamp;
        }
        let t = timestamp - start
        if(t<atime){
            gamecanvas.width |= 0;
            cursor.drawZoomed(t/atime, ctx)
            window.requestAnimationFrame(step)
        }
        else {
            animating=false
            redraw(cursor.depth+1)
        }
    }
    window.requestAnimationFrame(step)
    redraw()
}

function click(e){
    if (tutorial==4 ){
        tutorial+=1
    }
    if(animating) return;
    //console.log(e)
    if(zoominbut.disabled || zoominbut.style.visibility=="hidden" || e.button!=0) return;
    //https://stackoverflow.com/a/19048340/1779797
    let r = gamecanvas.getBoundingClientRect();
    let loc = cursor.getLocation((e.x - r.left) / gamecanvas.width, (e.y - r.top) / gamecanvas.width)
    //console.log(loc)
    if (loc!==undefined){
        pLocation[cursor.depth+1] = loc
        zoomIn()
    }
}
function copy(){
    if(animating) return;
    saves[cursor.depth] = cursor
    if (tutorial==6 && cursor.countPlants()>1){
        tutorial+=1
    }
    redraw()
}
function paste(){
    if(animating) return;
    if (tutorial==0){
        tutorial+=1
        zoomoutbut.style.visibility="visible"
    }
    harvest()
    seeds -= saves[cursor.depth].countPlants(cursor)
    map = map.clone()
    let c = map
    while(c.depth+1 < cursor.depth){
        c = c.getChildren()[pLocation[c.depth+1] ]
    }
    c.getChildren()
    c.children[pLocation[c.depth+1]] = saves[c.depth+1].pasteover(c.children[pLocation[c.depth+1]])
    //cursor = c.getChildren()[pLocation[c.depth+1] ]
    redraw()
}
function wait(){
    if(animating) return;
    time+=1
    if (tutorial==2){
        tutorial+=1
        harvestbut.style.visibility="visible"
    }
    map = map.wait()
    if(tutorial==7 && seeds + map.countPlants()>100){
        tutorial+=1
        expandbut.style.visibility="visible"
    }
    redraw()
}
function harvest(){
    if(animating) return;
    if (tutorial==3){
        tutorial+=1
        zoominbut.style.visibility="visible"
    }
    map = map.clone()
    let c = map
    while(c.depth+1 < cursor.depth){
        c = c.getChildren()[pLocation[c.depth+1] ]
    }
    c.getChildren()
    seeds += cursor.countPlants()
    c.children[pLocation[c.depth+1]] = cursor.harvest()
    redraw()
}
function expand(){
    if(animating) return;
    if(seeds<BigInt(expandCosts[nextUnlockDepth])) return;
    seeds -= BigInt(expandCosts[nextUnlockDepth])
    if (tutorial==8){
        tutorial+=1
    }
    let c = map
    while(c.depth+1 < cursor.depth){
        c = c.getChildren()[pLocation[c.depth+1] ]
    }
    if(nextUnlockDepth==minDepth)minDepth-=1
    nextUnlockLocation+=1
    if (nextUnlockLocation >= cursors[nextUnlockDepth-1].layerSize){
        nextUnlockLocation = 1
        nextUnlockDepth-=1
    }
    redraw(minDepth)
}