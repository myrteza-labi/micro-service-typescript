require('dotenv').config();
import * as R from 'ramda'
const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const uri = process.env.DB_URI;
const app = express();
const port = 4000;

app.use(express.json()); // Middleware pour traiter les données du corps des requêtes

// Connexion à MongoDB
mongoose.connect(uri);

mongoose.connection.on('open', () => {
  console.log(`Connected to MongoDB Atlas ${new Date()}`);
});

mongoose.connection.on('error', (error:any) => {
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
    .then(
      R.ifElse(
        R.isNil,
        () => res.status(404).send('Voiture non trouvée'),
        (voiture) => {
          req.voiture = voiture;
          next();
        }
      )
    )
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
    .then(() => {
      res.status(201); // Définir le statut 201 pour la création réussie
      sendJsonResponse(res, voiture);
    })
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
/**
 * @swagger
 * /voitures:
 *   post:
 *     summary: Créer une nouvelle voiture
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couleur:
 *                 type: string
 *               marque:
 *                 type: string
 *     responses:
 *       201:
 *         description: Voiture créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Voiture'
 */
app.post('/voitures', createVoiture);

// Route pour récupérer toutes les voitures
/**
 * @swagger
 * /voitures:
 *   get:
 *     summary: Récupérer toutes les voitures
 *     responses:
 *       200:
 *         description: Liste des voitures récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Voiture'
 */
app.get('/voitures', getAllVoitures);

// Route pour récupérer une voiture par son ID
/**
 * @swagger
 * /voitures/{id}:
 *   get:
 *     summary: Récupérer une voiture par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la voiture à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voiture récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Voiture'
 *       404:
 *         description: Voiture non trouvée
 */
app.get('/voitures/:id', checkVoitureExists, getVoitureById);

// Route pour mettre à jour une voiture par son ID
/**
 * @swagger
 * /voitures/{id}:
 *   put:
 *     summary: Mettre à jour une voiture par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la voiture à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couleur:
 *                 type: string
 *               marque:
 *                 type: string
 *     responses:
 *       200:
 *         description: Voiture mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Voiture'
 *       404:
 *         description: Voiture non trouvée
 */
app.put('/voitures/:id', checkVoitureExists, updateVoitureById);

// Route pour supprimer une voiture par son ID
/**
 * @swagger
 * /voitures/{id}:
 *   delete:
 *     summary: Supprimer une voiture par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la voiture à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voiture supprimée avec succès
 *       404:
 *         description: Voiture non trouvée
 */
app.delete('/voitures/:id', checkVoitureExists, deleteVoitureById);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
    },
    components: {
      schemas: {
        Voiture: {
          type: 'object',
          properties: {
            couleur: {
              type: 'string',
            },
            marque: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./app.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Routes Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Démarrer le serveur
app.listen(port, () => console.log('Server listening on port 4000'));

module.exports = app;
