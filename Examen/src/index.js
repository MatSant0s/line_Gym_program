const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const fs = require('fs');
const PDFDocument = require('pdfkit');


const { database } = require('./keys');

// Intializations
const app = express();
require('./lib/passport');

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs'
  
}))
app.set('view engine', '.hbs');

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({
  secret: 'faztmysqlnodemysql',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());

// variables globales de acceso concesido 

app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.user = req.user;
  next();
});

// Rutas de los metdos de ingreso al index y de nueestra atenticacion 
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));

// metodo publico de uso con el path de nuestro directorioso 

app.use(express.static(path.join(__dirname, 'public')));

// metod de inicio y arranque con el puerto 

app.listen(app.get('port'), () => {
  console.log('Server is in port', app.get('port'));
});








/* abrir una nueva ventan */


app.get('/progreso', (req, res) => {
  res.render('progreso'); // El nombre del archivo HBS sin la extensión
});


/* generar pdf*/


// Middleware para parsear los datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para procesar el formulario y generar el PDF
app.post('/procesar-formulario', (req, res) => {
  const { nombre, apellido, edad, genero, peso, dias_entrenados } = req.body;

  // Crear un nuevo documento PDF
  const doc = new PDFDocument();
  
  // Ruta y nombre del archivo PDF a generar
  const outputPath = `src/informes/${nombre}_${apellido}_progreso.pdf`;
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Agregar los datos del formulario al PDF
  doc.font('Helvetica').fontSize(14).text(`Nombre: ${nombre}`, 50, 50);
  doc.font('Helvetica').fontSize(14).text(`Apellido: ${apellido}`, 50, 70);
  doc.font('Helvetica').fontSize(14).text(`Edad: ${edad}`, 50, 90);
  doc.font('Helvetica').fontSize(14).text(`Género: ${genero}`, 50, 110);
  doc.font('Helvetica').fontSize(14).text(`Peso (kg): ${peso}`, 50, 130);
  doc.font('Helvetica').fontSize(14).text(`Días entrenados a la semana: ${dias_entrenados}`, 50, 150);

  // Finaliza el PDF
  doc.end();

  // Redireccionar a la página de éxito o cualquier otra acción que desees
  res.redirect('/progreso'); // Cambia '/exito' por la ruta que desees mostrar después de generar el PDF
});