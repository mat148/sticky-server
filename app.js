const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { response } = require('express');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));

var conn = mongoose.createConnection('mongodb://localhost:27017/sticky-database', {useUnifiedTopology: true});

const stickyNote = conn.model('StickyNote', new mongoose.Schema({
  note: String
}));

async function saveToDatabase(sticky) {
  let response = await sticky.save();

  return response;
}

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/stickyNoteAdd', (req, res) => {
  var stickyMessage = req.body.note;
  let sticky = new stickyNote({
    note: stickyMessage
  });

  saveToDatabase(sticky).then((response) => {
    res.send(response);
  });
});

app.get('/getAllSticky', (req, res) => {
  stickyNote.find({}).then(function(response) {
    res.send(response);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});