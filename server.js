const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const accountSid = 'replace with your own';
const authToken = 'replace with your own';
const client = require('twilio')(accountSid, authToken);
const XLSX = require('xlsx');

const workbook = XLSX.readFile('./data.xlsx');
const sheetNames = workbook.SheetNames;
const worksheet = workbook.Sheets[sheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(data);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/css', express.static(__dirname + 'public/css'))
app.set('view engine', 'ejs');

const neighborhoods = [
  { id: 1, name: 'Downtown' },
  { id: 2, name: 'Uptown' },
  { id: 3, name: 'Midtown' }
];

let reports = [
  { id: 1, neighborhoodId: 1, description: 'Overflowing garbage can.', isResolved: false },
  { id: 2, neighborhoodId: 2, description: 'Pile of trash on the sidewalk at Uptown St.', isResolved: false },
  { id: 3, neighborhoodId: 3, description: 'Abandoned couch on the corner of Midtown St.', isResolved: true }
];

app.get('/', (req, res) => {
  res.render('index', { neighborhoods });
});

app.get('/neighborhood/:id', (req, res) => {
  const id = req.params.id;
  const neighborhood = neighborhoods.find(n => n.id == id);
  const neighborhoodReports = reports.filter(r => r.neighborhoodId == id);
  res.render('neighborhood', { neighborhood, neighborhoodReports });
});

app.get('/new', (req, res) => {
  res.render('new', { neighborhoods });
});

app.post('/new', async (req, res) => {
  const { neighborhoodId, description } = req.body;
  const id = reports.length + 1;
  reports.push({ id, neighborhoodId, description, isResolved: false });
  await message(description, neighborhoodId,"");
  res.redirect('/');
});

app.post('/resolve', async(req, res) => {
  const { reportId } = req.body;
  const report = reports.find(r => r.id == reportId);
  report.isResolved = true;
  const NID = report.neighborhoodId;
  const desc = report.description;
  await message(desc,NID," has been resolved!");
  res.redirect('/');
});

async function message(desc,id,resolve) {
    data.forEach((dict) => {
        if (dict.NID == id) {
            client.messages.create({
                body: `Hello ${dict.Name}! This is a message from the neighbourhood trash watch: ${desc} ${resolve}`,
                from: '+16206590869',
                to: dict.Number})
            .then(message => console.log(message.sid));
        }
      });
  }

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
