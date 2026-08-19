import 'dotenv/config'
import mongoose from 'mongoose'

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = encodeURIComponent(process.argv[2])
const template = process.env.MONGODB_URI_TEMPLATE

if (!template) {
  console.log('MONGODB_URI_TEMPLATE is missing from .env')
  process.exit(1)
}

const url = template.replace('<password>', password)

mongoose.set('strictQuery', false)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

mongoose.connect(url, { family: 4 }).then(() => {
  if (process.argv.length === 3) {
    return Person.find({}).then((persons) => {
      console.log('phonebook:')
      persons.forEach((person) => {
        console.log(`${person.name} ${person.number}`)
      })
      return mongoose.connection.close()
    })
  }

  if (process.argv.length === 5) {
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4],
    })

    return person.save().then(() => {
      console.log(`added ${person.name} number ${person.number} to phonebook`)
      return mongoose.connection.close()
    })
  }

  console.log('usage: node mongo.js password [name number]')
  return mongoose.connection.close()
})
