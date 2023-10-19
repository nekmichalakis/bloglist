const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/users')
mongoose.set("bufferTimeoutMS", 30000)

let token = ''
let initialBlogs = [
    {
        title: 'numberone',
        author: 'me',
        url: 'ajshfaskdh',
        likes: 14
    },
    {
        title: 'numbertwo',
        author: 'you',
        url: 'kjfbvdajg',
        likes: 33
    }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

beforeAll(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()

    const response = await api.post('/api/login')
        .send({ username: 'root', password: 'sekret' })
    
    token = response.body.token
  })

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned and json', async () => {
    const response = await api
        .get('/api/blog')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(initialBlogs.length)
})

test('blogs have id property', async () => {
    const response = await api.get('/api/blog')

    expect(response.body[0].id).toBeDefined()
})

test('new blogs get successfully created', async () => {
    const newBlog = {
        title: 'testblogrone',
        author: 'me',
        url: 'jakghdkj',
        likes: 2
    }

    await api
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

    const response = await blogsInDb()
    const titles = response.map(r => r.title)

    expect(response).toHaveLength(initialBlogs.length + 1)
    expect(titles).toContain(newBlog.title)
})

test('when likes are missing add zero', async () => {
    const newBlog = {
        title: 'likelessblog',
        author: 'me',
        url: 'jakghdkj',
    }

    await api.post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)

    const response = await blogsInDb()
    expect(response[initialBlogs.length].likes).toBe(0)
})

test('when title or url missing status 400', async () => {
    const noTitle = {
        author: 'idontnknow',
        url: 'ssgsdg'
    }

    const noUrl = {
        author: 'idontnknow',
        title: 'ssgsdg'
    }

    await api.post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send(noTitle)
        .expect(400)
    await api.post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send(noUrl)
        .expect(400)
})

test('blog is deleted successfully status 204', async () => {
    const newBlog = {
        title: 'likelessblog',
        author: 'me',
        url: 'jakghdkj',
    }

    await api.post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)

    const response = await blogsInDb()
    const lastItemId = response[2].id
    console.log('ID', lastItemId)

    await api.delete(`/api/blog/${lastItemId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

    const afterDelete = await blogsInDb()
    expect(afterDelete.length).toBe(initialBlogs.length)
})

describe('editing a blog', () => {
    test('blog is edited', async () => {
        const newBlog = {
            title: 'tirpleeight',
            author: 'me',
            url: 'jakghdkj',
            likes: 888
        }

        const response = await api.get('/api/blog')
        firstItemId = response.body[0].id

        const editedResponse = await api.put(`/api/blog/${firstItemId}`)
            .send(newBlog)
            .expect(200)

        expect(editedResponse.body.likes).toBe(888)
        expect(editedResponse.body.id).toBe(firstItemId)
    })

    test('if loco id no go status 400', async () => {
        const newBlog = {
            title: 'tirpleeight',
            author: 'me',
            url: 'jakghdkj',
            likes: 888
        }
        const locoId = '5a3d5da59070081a82a3445'

        const editedResponse = await api.put(`/api/blog/${locoId}`)
            .send(newBlog)
            .expect(400)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})