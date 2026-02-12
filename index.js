import express from 'express';
import pokemon from './schema/pokemon.js';

import './connect.js';

import cors from 'cors'; 

const app = express();

app.use(express.json());
app.use(cors()); // car le Back bloque le Front à cause d'une CORS error

app.get('/', (req, res) => {
  res.send('Poke Julio');
});


// afficher les 10 premiers poke, http://localhost:3000/pokemons?page=2
app.get('/pokemons', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;  // 9 par défaut
    const skip = (page - 1) * limit;

    console.log(`REQ: page=${page}, limit=${limit}, skip=${skip}`);
    
    const pokemons = await pokemon.find({}).skip(skip).limit(limit).sort({ id: 1 });
    const total = await pokemon.countDocuments({});
    
    res.json({
      pokemons,
      page,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/pokemons/:id', async (req, res) => {
  try {
    const pokeId = parseInt(req.params.id, 10);
    const poke = await pokemon.findOne({ id: pokeId });
    if (poke) {
      res.json(poke);
    } else {
      res.status(404).json({ error: 'Pokemon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// trouver le poke à partir de son nom français
app.get('/pokemons/name/:nom', async (req, res) => {
  try {
    const nom = req.params.nom;
    const poke = await pokemon.findOne({ 
      'name.french': { $regex: nom, $options: 'i' } // regex pour trouver facilement 
    });
    if (poke) {
      res.json(poke);
    } else {
      res.status(404).json({ error: 'Pokemon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// créer un nouveau poke avec json
app.post('/pokemons', async (req, res) => {
  try {
    const newPoke = new pokemon(req.body);
    await newPoke.save();
    res.status(201).json(newPoke);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// modif un poke existant avec json
app.put('/pokemons/:id', async (req, res) => {
  try {
    const pokeId = parseInt(req.params.id, 10);
    const poke = await pokemon.findOneAndUpdate({ id: pokeId },
      req.body,
      {new: true}
    );
    if (poke) {
      res.json(poke);
    } else {
      res.status(404).json({ error: 'Pokemon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/pokemons/:id', async (req, res) => {
  try {
    const pokeId = parseInt(req.params.id, 10);
    const poke = await pokemon.findOneAndDelete({ id: pokeId });
    if (poke) {
      res.json({ message: 'Pokemon deleted' });
    } else {
      res.status(404).json({ error: 'Pokemon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



console.log('Server is set up. Ready to start listening on a port.');

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});