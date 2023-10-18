const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/users')
const bcrypt = require('bcrypt')

describe('when one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('success with new username', async () => {
        const usersAtStart = await User.find({})

        const newUser = {
            username: 'nekmich',
            name: 'Nektarios',
            password: '1234'
        }

        await api.post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await User.find({})
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
        expect(usersAtEnd[1].username).toBe(newUser.username)
    })

    test('fail when username taken status 400 error message', async () => {
        const usersAtStart = await User.find({})

        const newUser = { username: 'root', password: 'blabla' }

        const result = await api.post('/api/users')
            .send(newUser)
            .expect(400)

        expect(result.body.error).toContain('expected `username` to be unique')

        const usersAtEnd = await User.find({})
        expect(usersAtEnd).toEqual(usersAtStart)
    })

    test('fail when password too short status 400 error message', async () => {
        const usersAtStart = await User.find({})

        const newUser = { username: 'shortie', password: 'aa' }

        const result = await api.post('/api/users')
            .send(newUser)
            .expect(400)

        expect(result.body.error).toContain('password should be at least 3 characters long')

        const usersAtEnd = await User.find({})
        expect(usersAtEnd).toEqual(usersAtStart)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})