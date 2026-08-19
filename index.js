import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import Person from './models/person.js'

const app = express()
const mongoUrl = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

if (mongoUrl) {
  mongoose
    .connect(mongoUrl, { family: 4 })
    .then(() => console.log('connected to MongoDB'))
    .catch((error) => console.log('error connecting to MongoDB:', error.message))
} else {
  console.log('MONGODB_URI is not configured yet')
}

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (request) => {
  if (request.method === 'POST') {
    return JSON.stringify(request.body)
  }
  return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => response.json(persons))
    .catch(next)
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      response.send(`Phonebook has info for ${count} people<br/><br/>${new Date()}`)
    })
    .catch(next)
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(next)
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(next)
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'name or number is missing' })
  }

  Person.findOne({ name })
    .then((existingPerson) => {
      if (existingPerson) {
        return response.status(400).json({ error: 'name must be unique' })
      }

      const person = new Person({ name, number })
      return person.save().then((savedPerson) => response.status(201).json(savedPerson))
    })
    .catch(next)
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' },
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(next)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
