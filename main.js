let request=require("request");
let cheerio=require("cheerio");

let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";
let scoreCardObj=require("./ScoreBoard");
request(url, cb);
function cb(error, response, html) {
    if (error) {
        console.log(error); 
    } else if (response.statusCode == 404) {
        console.log("Page Not Found")
    }
    else {
        dataExtracter(html);
    }
}
let complink;
function dataExtracter(html){
    let searchTool=cheerio.load(html);
    let anchor= searchTool("a[data-hover='View All Results']");
    let link=anchor.attr("href");
    complink="https://www.espncricinfo.com"+link;
    request(complink, cb1);
}

function cb1(error, response, html) {
    if (error) {
        console.log(error); 
    } else if (response.statusCode == 404) {
        console.log("Page Not Found")
    }
    else {
        Scorecard(html);
    }
}
function Scorecard(html){
    let searchTool=cheerio.load(html);
    let anchor= searchTool("a[data-hover='Scorecard']");

    for(let i=0;i<anchor.length;i++){
        let score=searchTool(anchor[i]).attr("href");
        let comp="https://www.espncricinfo.com"+score;
        // console.log(comp);
        scoreCardObj.processSingleMatch(comp);
    }
}