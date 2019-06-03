const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1tLY0_jjltXvQsrfAZVwarA2RJR8Wcg_Km7ws775-mb4';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  //console.log(rows);

  // TODO(you): Finish onGet.
  let dataArr=[];
  for(var row=1;row<rows.length;row++){
    //each rows
    tempData={};
    for(var key of rows[0]){
      tempData[key]=rows[row][rows[0].indexOf(key)];
      //ex:nth data[name]=rows[nth][indexOf(name)]
    }
    //dataArr[row-1]=tempData;
    dataArr.push(tempData);
  }
  console.log(dataArr);
  res.json(dataArr);
  //res.json( { status: 'unimplemented!!!'} );
}
app.get('/api', onGet);

async function onPost(req, res) {
  const messageBody = req.body;
  
  // TODO(you): Implement onPost.
  const result = await sheet.getRows();
  const rows = result.rows;

  let tempData=[];//API must use array
  for(var key in messageBody){
    tempData[rows[0].indexOf(key)]=messageBody[key];
    //ex: tempData[indexOf(name)]=messageBody[name]
    //avoid change key's order
  }
  //console.log(tempData);
  const dump=await sheet.appendRow(tempData);
  res.json({response: 'success'});
  //res.json( { status: 'unimplemented'} );
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  // TODO(you): Implement onPatch.
  const result = await sheet.getRows();
  const rows = result.rows;
  let target=-1;

  for(var row=1;row<rows.length;row++){
    //search each row
    if(rows[row][rows[0].indexOf(column)]===value){
      target=row;
      console.log("target: "+target+"->"+column+":"+value);
      break;
    }
  }
  if(target===-1){
    console.log("can't find target.");
  }
  else{
    let tempData=rows[target];
    //console.log(tempData);
    //Due to array doesn't have key. Use indexOf
    for(var key in messageBody){
      tempData[rows[0].indexOf(key)]=messageBody[key];
    }
    //console.log(tempData);
    const dump=await sheet.setRow(target,tempData);
  }

  res.json({response: 'success'});
  //res.json( { status: 'unimplemented'} );
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;

  // TODO(you): Implement onDelete.
  const result = await sheet.getRows();
  const rows = result.rows;

  for(var row=1;row<rows.length;row++){
    //search each row
    if(rows[row][rows[0].indexOf(column)]===value){
      const dump=await sheet.deleteRow(row);
      console.log("delete: "+column+":"+value);
      break;
    }
  }

  res.json({response: 'success'});
  //res.json( { status: 'unimplemented'} );
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`CS193X: Server listening on port ${port}!`);
});
