/*
 * Test suite for posts.js
 */
var request = require('request')

function url(path) {
    return "http://localhost:3000" + path
}

describe('Validate Post Functionality', function() {

    it('initially should give me three or more posts', function(done) {
        request({
                url: url("/posts/"),
                method: 'GET'
            },
            function(err, res, body) {
                body = JSON.parse(body)
            	//console.log(body.posts.length)
                expect(body.posts.length).toBeGreaterThan(2)
                done()
            })

    }, 300)

    it('should add a new post, and the number of posts should increase by one', function(done) {
        // firstly get posts and count its number 
        request({
                url: url("/posts/"),
                method: 'GET'
            },
            function(err, res, body) {
                body = JSON.parse(body)
                //console.log(body.posts.length)
                var initPostsLength = body.posts.length
                // then post a new post  
                request({
                        url: url("/post/"),
                        method: 'POST',
                        json: { body: 'test post' }
                    },
                    function(err2, res2, body2) {
                        //console.log(body2.posts[0].body)
                        expect(body2.posts[0].body).toBe('test post')
                        //finally get posts for another time, test if its length increased by 1
                        request({
                            url: url("/posts/"),
                            method: 'GET'
                        },
                        function(err3, res3, body3) {
                            body3 = JSON.parse(body3)
                            //console.log(body3.posts.length)
                            expect(body3.posts.length).toBe(initPostsLength + 1)
                            done()
                        })
                    })
            })      
    }, 300)

    it('should return a post with a specified id', function(done) {
        // get the posts, find one random post in it and store its id
        request({
                url: url("/posts/"),
                method: 'GET'
            },
            function(err, res, body) {
                var randomId
            	body = JSON.parse(body)           	
            	randomId = body.posts[Math.ceil(Math.random() * body.posts.length)].id

                // get the post with that random id specified,test the result only return one post
                request({
                    url: url("/posts/" + randomId),
                    method: 'GET'
                },
                function(err2, res2, body2) {
                    body2 = JSON.parse(body2)
                    //console.log(body2.posts)
                    expect(body2.posts.length).toBe(1)
                    done()
                })
            })
    }, 300)

    it('should return nothing for an invalid id', function(done) {
        //test if type a wrong id, there is no post returned
        request({
                    url: url("/posts/0/"),
                    method: 'GET'
                },
                function(err, res, body) {
                    expect(body.posts).toBe(undefined)
                    done()
                })
    }, 300)


});