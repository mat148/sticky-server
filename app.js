const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { response } = require('express');
const sanitizeHtml = require('sanitize-html');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));

const oneDay = 1000 * 60 * 60 * 24;
const today = JSON.stringify(new Date());

var conn = mongoose.createConnection('mongodb://localhost:27017/sticky-database', {useUnifiedTopology: true});

const stickyNote = conn.model('StickyNote', new mongoose.Schema({
  note: String,
  createDate: String,
  endDate: String,
  reported: Boolean,
  fingerPrint: String
}));

async function saveToDatabase(sticky) {
  let response = await sticky.save();

  return response;
}

app.get('/', (req, res) => {});

app.post('/stickyNoteAdd', (req, res) => {
  const currentDate = new Date();
  var adjustedDate = new Date();
  adjustedDate.setDate(adjustedDate.getDate() + 14);
  var stickyMessage = sanitizeHtml(req.body.note, {
    allowedTags: ['strong', 'i', 'h1', 'h2', 'h3', 'code', 'u' , 's'],
    allowedAttributes: {}
  });
  var fingerPrint = req.body.fingerPrint;

  console.log(fingerPrint);

  let sticky = new stickyNote({
    note: stickyMessage,
    createDate: JSON.stringify(currentDate),
    endDate: JSON.stringify(adjustedDate),
    reported: false,
    fingerPrint: fingerPrint
  });

  saveToDatabase(sticky).then((response) => {
    console.log('Save to Database');
    res.send(response);
  });
});

app.post('/stickyNoteEdit', (req, res) => {
  var noteID = req.body.noteID;
  var objectId = mongoose.Types.ObjectId(noteID);
  var note = req.body.note;

  conn.collections.stickynotes.updateOne({_id:objectId}, {$set:{note:note}}, function(err, result) {
    if(err) {
      console.error(err);
    } else res.send(result);
  })
});

app.post('/stickyNoteDelete', (req, res) => {
  var noteID = req.body.noteID;
  var objectId = mongoose.Types.ObjectId(noteID);

  conn.collections.stickynotes.deleteOne({_id: objectId})
  .then((response) => {
    res.send(response);
  });
});

app.get('/getAllSticky', (req, res) => {
  var filter = {"endDate": {
    $gt: today
  }}

  stickyNote.find(filter).then(function(response) {
    res.send(response);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});