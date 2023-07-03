require('dotenv').config();
const R = require('ramda');
const mongoose = require('mongoose');
const express = require('express');

const uri = process.env.DB_URI;
const app = express();
const port = 3000;

app.use(express.json()); // Middleware pour traiter les données du corps des requêtes

// Connexion à MongoDB
mongoose.connect(uri);

mongoose.connection.on('open', () => {
  console.log(`Connected to MongoDB Atlas ${new Date()}`);
});

mongoose.connection.on('error', (error) => {
  console.error('Failed to connect to MongoDB Atlas', error);
});

// Définition du modèle Voiture
const voitureSchema = new mongoose.Schema({
  couleur: String,
  marque: String,
});

const VoitureModel = mongoose.model('Voiture', voitureSchema);

// Middleware pour gérer les erreurs
const errorHandler = (res, error) => {
  console.error(error);
  res.status(500).send('Erreur serveur');
};

// Middleware pour vérifier si une voiture existe
const checkVoitureExists = (req, res, next) => {
  const voitureId = req.params.id;
  VoitureModel.findById(voitureId)
    .then(R.ifElse(
      R.isNil,
      () => res.status(404).send('Voiture non trouvée'),
      (voiture) => {
        req.voiture = voiture;
        next();
      }
    ))
    .catch((error) => {
      errorHandler(res, error);
    });
};

// Fonction pour envoyer une réponse JSON
const sendJsonResponse = (res, data) => {
  res.json(data);
};

// Fonction pour créer une voiture
const createVoiture = (req, res) => {
  const { couleur, marque } = req.body;
  const voiture = { couleur, marque };

  VoitureModel.create(voiture)
    .then(R.partial(sendJsonResponse, [res]))
    .catch((error) => {
      errorHandler(res, error);
    });
};

// Fonction pour récupérer toutes les voitures
const getAllVoitures = (req, res) => {
  VoitureModel.find()
    .then(R.partial(sendJsonResponse, [res]))
    .catch((error) => {
      errorHandler(res, error);
    });
};

// Fonction pour récupérer une voiture par son ID
const getVoitureById = (req, res) => {
  res.json(req.voiture);
};

// Fonction pour mettre à jour une voiture par son ID
const updateVoitureById = (req, res) => {
  const { couleur, marque } = req.body;

  VoitureModel.findByIdAndUpdate(req.voiture._id, { couleur, marque }, { new: true })
    .then(R.partial(sendJsonResponse, [res]))
    .catch((error) => {
      errorHandler(res, error);
    });
};

// Fonction pour supprimer une voiture par son ID
const deleteVoitureById = (req, res) => {
  VoitureModel.findByIdAndRemove(req.voiture._id)
    .then(R.partial(sendJsonResponse, [res]))
    .catch((error) => {
      errorHandler(res, error);
    });
};

// Route pour créer une voiture
app.post('/voitures', createVoiture);

// Route pour récupérer toutes les voitures
app.get('/voitures', getAllVoitures);

// Route pour récupérer une voiture par son ID
app.get('/voitures/:id', checkVoitureExists, getVoitureById);

// Route pour mettre à jour une voiture par son ID
app.put('/voitures/:id', checkVoitureExists, updateVoitureById);

// Route pour supprimer une voiture par son ID
app.delete('/voitures/:id', checkVoitureExists, deleteVoitureById);

// Démarrer le serveur
app.listen(port, () => console.log('Server listen port 3000'));
