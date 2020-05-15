const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('body', function (req, res) {
  if (req.body.name) {
    return JSON.stringify(req.body)
  }
  return null
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-532523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]

app.get('/info', (request, response) => {
  response.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>
  `)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person.toJSON())
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const id = Math.floor(Math.random() * 9999)
  return id + 1
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  })
  
  /*
  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
  */
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})