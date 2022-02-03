let request=require("request");
let cheerio=require("cheerio");
let fs=require("fs");
let path=require("path");
let xlsx=require("xlsx");
function processSingleMatch(url) {
    request(url, cb);
}
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

function dataExtracter(html){
    let searchTool=cheerio.load(html);
    let teamArr= searchTool(".Collapsible ");
    for(let i=0;i<teamArr.length;i++){
        let teamName=searchTool(teamArr[i]).find("h5");
        teamName=teamName.text();
        teamName=teamName.split("INNINGS")[0];
        teamName=teamName.trim();
        let playerData=searchTool(teamArr[i]).find(".table.batsman tbody tr");
        for(let j=0;j<playerData.length;j++){
            let numTd=searchTool(playerData[j]).find("td");
            if(numTd.length==8){
                let playerName=searchTool(numTd[0]).text();
                let runs=searchTool(numTd[2]).text();
                let balls=searchTool(numTd[3]).text();
                let six=searchTool(numTd[5]).text();
                let sr=searchTool(numTd[6]).text();
                // console.log("Player",playerName,"played for team",teamName,"scored",runs,"in",balls,"balls with",six,"sixes with sr",sr);
                processPlayer(teamName,playerName,runs,balls,sr);
            }
        }
    }
}
function processPlayer(teamName,playerName,runs,balls,sr)
{
    let obj={
        teamName,
        playerName,
        runs,
        balls,
        sr
    }
    let dirPath = path.join(__dirname, teamName);
    if(!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);  
    }
    let filepath=path.join(dirPath,playerName+"txt");
    let playerArr=[];
    if(fs.existsSync(filepath)){
        playerArr=getContent(filepath);
        // playerArr=excelReader(filepath,playerName);
        playerArr.push(obj);
    }else{
        playerArr.push(obj);
    }
    writeContent(filepath,playerArr);
    // excelWriter(filepath,playerArr,playerName);
}

function getContent(filePath){
    let content=fs.readFileSync(filePath);
    return JSON.parse(content);
}

function writeContent(filePath,playerArr){
    
    let jsonData=JSON.stringify(playerArr);

    fs.writeFileSync(filePath,jsonData);
}
module.exports={
    processSingleMatch
}

function excelWriter(filePath, json, sheetName) {
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
}

function excelReader(filePath, sheetName) {
    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}