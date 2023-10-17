const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((a, b) => a + b.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((a, b) => a.likes > b.likes ? a : b, 0)
}

const mostBlogs = (blogs) => {

    if (blogs.length < 1) return 0
    
    const counts = {}
    blogs.forEach(blog => {
        counts[blog.author] = (counts[blog.author] || 0) + 1
    })
    countsArr = Object.entries(counts)
    reducedArr = countsArr.reduce((a, b) => a[1] > b[1] ? a : b)
    return ({ author: reducedArr[0], blogs: reducedArr[1] })
}

const mostLikes = (blogs) => {

    if (blogs.length < 1) return 0

    const counts = {}
    blogs.forEach(blog => {
        counts[blog.author] = (counts[blog.author] || 0) + blog.likes
    })
    countsArr = Object.entries(counts)
    reducedArr = countsArr.reduce((a, b) => a[1] > b[1] ? a : b)
    return ({ author: reducedArr[0], likes: reducedArr[1] })
}
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}