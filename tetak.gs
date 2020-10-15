function checkPayments() {
  Logger.log('START COLLECTING DEBTS!');
  
  var sheetUrl = '<SHEET_URL>';
  
  var ss = SpreadsheetApp.openByUrl(sheetUrl)
  var sheet = SpreadsheetApp.getActiveSheet();
 
  var searchRange = sheet.getRange(3,1, 25, 15); // table range
  var numRows = searchRange.getNumRows();
  var usersCount = 0
  var allDebts = 'Users who still havent paid for TETA this week: \n';
  
  for (var i = 1; i <= numRows; i++) {
    
      var user = searchRange.getCell(i,2).getValue(); // full name, logging purposes
      var username = searchRange.getCell(i,1).getValue(); // slack username for mention
      var amount = searchRange.getCell(i,13).getValue(); // amount of money
      var isPaid = searchRange.getCell(i,15).getValue() === 'TRUE' || searchRange.getCell(i,15).getValue() === true; // boolean (checkbox in sheet) - checked if the user already paid, so he isn't mentioned next time
    
    if (amount > 0 && !isPaid) {
      Logger.log("User " + user + " forgot to pay " + amount + " money.");
      usersCount++;
      allDebts = allDebts + ' <'+  username +  '> ' + '(' + amount + ' KN) \n';
    }
  }
  
  // send to slack
  if(usersCount > 0){
     sendToSlack(allDebts);
  }
}
  

function sendToSlack(message) {

  var url = "<SLACK_HOOK_URL>";
  
  var payload = {
     "channel" : "#klopa",
     "text" : message
  };
  
  var options =  {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(payload)
  };
  
  return UrlFetchApp.fetch(url, options);
}

function sendEmailOrders(html) {
  var to = "order@example.com"
  var cc = "email@example.com"
  var replyTo = "reply@example.com"

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();

  today = ` ${dd}.${mm}.${yyyy}`
  subject = `Food order - Company (${today})`

  MailApp.sendEmail({to: to, cc: cc, replyTo: replyTo, subject: subject, htmlBody: html})
}

function getFoodOrders() {

  var sheet = SpreadsheetApp.getActiveSheet();
  var startRow = 3; // First row of data to process
  var numRows = 28; // Number of rows to process
  var dataRange = sheet.getRange(startRow, 17, numRows, 1);
  var data = dataRange.getValues();
  var food = []

  for (var i in data) {
    if (data[i][0].length > 0)
      food.push(data[i][0])
  }

  return food

}

function processOrdersAndSendEmails() {
  foodList = getFoodOrders()
  if (foodList.length > 0) {
    sendEmailOrders(OrderFoodTemplate(foodList))
  }
}