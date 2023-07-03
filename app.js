require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');

const uri = process.env.DB_URI;
const app = express();
const port = 3000;

app.use(express.json()); // Middleware pour traiter les données du corps des requêtes

// implémentation d'une fonction de création d'objet
// dans la BDD : 
// 1) Définir le schema mongoose de l'objet 
// 2) Définir le model mongoose du schema de l'objet
// 3) Utiliser la methode "create" du model pour inserer 
// le nouvel objet dans la BDD
// 4) Utiliser la methode then pour expliquer
// ce que le code doit faire en cas de succes
// 5) Utiliser la methode "catch" pour receptionner
// les erreurs en cas d'echec de la creation de l'objet

// 1) Définir le schema mongoose 
const voitureSchema = new mongoose.Schema({
  couleur: String, 
  marque: String
})

// 2) Créer le modèle à partir du schéma
const VoitureModel = mongoose.model('Voiture', voitureSchema);

app.listen(port, () => console.log('Server listen port 3000'));

app.get('/', (req, res) => res.send('Serveur lancé'));

mongoose.connect(uri);

mongoose.connection.on('open', () => {
  console.log(`Connected to MongoDB Atlas ${new Date()}`);
});

mongoose.connection.on('error', (error) => {
  console.error('Failed to connect to MongoDB Atlas', error);
});

// Route pour créer un nouvel objet voiture
app.post('/voitures', (req, res) => {
  const { couleur, marque } = req.body; // Récupérer les données du corps de la requête

// Créer un nouvel objet voiture
  const voiture = { couleur, marque };

// 3) Utiliser le modèle Mongoose pour la collection "voitures" et effectuer l'opération d'insertion
  VoitureModel.create(voiture)
// 4) Utiliser la methode "then" pour expliquer
// ce que le code doit faire en cas de succes
    .then((voitureCreee) => {
      res.send(`L'objet ${voitureCreee} a été créé avec succes`); // Répondre avec l'objet voiture créé
    })
// 5) Utiliser la methode "catch" pour receptionner
// les erreurs en cas d'echec de la creation de l'objet
    .catch((error) => {
      console.error('Erreur lors de l\'insertion de la voiture', error);
      res.status(500).send('Erreur lors de l\'insertion de la voiture');
    });
});
