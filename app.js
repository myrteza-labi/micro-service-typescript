require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');

const uri = process.env.DB_URI;
const app = express();
const port = 3000;

app.use(express.json()); // Middleware pour traiter les données du corps des requêtes

// Définir le schéma de la voiture
const voitureSchema = new mongoose.Schema({
  couleur: String,
  marque: String
});

// Créer le modèle à partir du schéma
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

  // Utiliser le modèle Mongoose pour la collection "voitures" et effectuer l'opération d'insertion
  VoitureModel.create(voiture)
    .then((voitureCreee) => {
      res.send(voitureCreee); // Répondre avec l'objet voiture créé
    })
    .catch((error) => {
      console.error('Erreur lors de l\'insertion de la voiture', error);
      res.status(500).send('Erreur lors de l\'insertion de la voiture');
    });
});
