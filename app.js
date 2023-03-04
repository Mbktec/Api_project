const express = require('express')
const morgan = require('morgan')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')
const {success, getUniqueId} = require('./helper.js')
let pokemons = require('./mock-pokemon')
const PokemonModel = require('./src/models/pokemon')

const app = express()
const port = 3000
//connexion à la base de données
const sequelize = new Sequelize(
    'Pokédex',
    'root',
    '',
    {
        host: 'localhost',
        dialect: 'mariadb',
        dialectOptions: {
            timezone: 'Etc/GMT-2'
        },
        logging: false
    }
)
//commentaire de la connexion à la base 
sequelize.authenticate()
    .then(_ => console.log('La connexion à la base de données a bien été établie'))
    .catch(error => console.log(`Impossible de se connecter à la base de données ${error}`))

const Pokemon = PokemonModel(sequelize, DataTypes)

sequelize.sync({force: true})
    .then(_ => {
        console.log('La base de données "Pokemon" a bien été synchronisée')

        pokemons.map(pokemon => {
            Pokemon.create({
              name: pokemon.name,
              hp: pokemon.hp,
              cp: pokemon.cp,
              picture: pokemon.picture,
              types: pokemon.types.join()
            }).then(pokemon => console.log(pokemon.toJSON()))
})
})
// app.use(
//     (req, res, next) => {
//         console.log(`URL: ${req.url}`)
//         next()
//     }
// )
app
    .use(favicon(__dirname + '/favicon.ico'))
    .use(morgan('dev'))
    .use(bodyParser.json())

app.get('/api/pokemons/:id', (req, res) => {
   const id = parseInt(req.params.id)
   const pokemon = pokemons.find(pokemon => pokemon.id === id)
   const message = 'Un pokémon a bien été trouvé.'
       res.json(success(message, pokemon))
 })

 app.post('/api/pokemons', (req, res) => {
    const id = getUniqueId(pokemons)
    const pokemonCreated = { ...req.body, ...{id: id, created: new Date()}}
    pokemons.push(pokemonCreated)
    const message = `Le pokémon ${pokemonCreated.name} a bien été crée.`
    res.json(success(message, pokemonCreated))
  })
  
  app.put('/api/pokemons/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const pokemonUpdated = { ...req.body, id: id }
    pokemons = pokemons.map(pokemon => {
     return pokemon.id === id ? pokemonUpdated : pokemon
    })
    const message = `Le pokémon ${pokemonUpdated.name} a bien été modifié.`
 res.json(success(message, pokemonUpdated))
});

app.delete('/api/pokemons/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const pokemonDeleted = pokemons.find(pokemon => pokemon.id === id)
    pokemons = pokemons.filter(pokemon => pokemon.id !== id)
    const message = `Le pokémon ${pokemonDeleted.name} a bien été supprimé.`
    res.json(success(message, pokemonDeleted))
  });

app.get('/api/pokemons', (req, res) => {
    const message = 'La liste de pokemon a été bien récupérée.'
    res.json(success(message,  pokemons)) 
})

app.get('/', (req,res) => res.send('Hello again, Express 3!'))

app.listen(port, () => console.log(`Notre application Node est démarrée sur : http://localhost:${port}`))