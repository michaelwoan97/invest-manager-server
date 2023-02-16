const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require("../server")
const dataTest = require("./data-testing")

//assertion style
const should = chai.should();

// use chaiHttp for making the actual HTTP requests
chai.use(chaiHttp)
describe("Automated Testing API", () => {
    let isAuthenticated = false;
    let doHaveUserID = false;
    let doHaveSneakerID = false;
    let userTestingID;
    let sneakerUpdateID;
    let refreshToken;
    let accessToken;
    

    const newUserTestingCredential = {
        'name': 'pp125@gmail.com',
        'password': '1234',
    }
    const newUserTesting ={
        ...newUserTestingCredential,
        'data': []
    }


    it("POST /adduser will fail if all fields are not provided", (done) => {
        chai.request(server)
            .post("/adduser")
            .end((err, response) => {
                
                
                const result = JSON.parse(response.body)
                result.should.have.property('success').eq(false)
                done()
            })
    })

    it("POST /adduser will succeed if all fields are provided and followed format", (done) => {
        chai.request(server)
            .post('/adduser')
            .send(newUserTesting)
            .end(function(err,response) {
                response.should.have.status(200)

                const result = JSON.parse(response.body)
                result.should.have.property('success').eq(true)
                done()

                
            })
    })

    /**
     * Test authenticate, authorize users & CRUD operations
     * C: create a sneaker
     * R: get sneaker list
     * U: update sneaker
     * D: delete sneaker
     */

    /**
     * Test authenticate & authorize users
     */
    it("POST /authenticate ", (done) => {
        
        chai.request(server)
            .post('/authenticate')
            .send(newUserTestingCredential)
            .end(function(err,response) {
                response.should.have.status(200)

                let result = JSON.parse(response.body)
                result.should.have.property('success').eq(true)
                result.should.have.property('token').not.eq(null)
                result.should.have.property('refreshToken').not.eq(null)
                isAuthenticated = true
                accessToken = result.token
                refreshToken = result.refreshToken
                done()
            }) 

    })

    describe("Automated Testing API requests on authenticated endpoint", () => {
        beforeEach(function() {
            if(!isAuthenticated){
                throw console.error("User is not authenticated!!!");
            }
        })

        /**
         * Test get userID
         */
        it("GET /getdata/info", (done) => {
            if(!accessToken){
                throw console.error("No Access Token!!!");
            }

            chai.request(server)
                .get('/getdata/info')
                .set('authorization', `Bearer ${accessToken}` )
                .end(function(error,res) {
                    res.should.have.status(200)

                    const result = JSON.parse(res.body)
                    result.should.have.property("success").eq(true)
                    result.should.have.nested.property("msg.userID").not.eq(null)
                    doHaveUserID = true
                    userTestingID = result.msg.userID
                    done()
                })
        })
    
        /**
         * Test add sneakers
         */
        it("POST /updatedata/addsneaker", (done) => {

            if(!doHaveUserID){
                throw console.error("UserID is not existed!!!");
            }

            chai.request(server)
                .post('/updatedata/addsneaker')
                .set('authorization', `Bearer ${accessToken}` )
                .send({"userID": userTestingID, "newSneaker": JSON.stringify(dataTest.newSneakerDataTest)})
                .end(function(err,response) {
                    response.should.have.status(200)

                    const result = JSON.parse(response.body)
                    result.should.have.property('success').eq(true)
                    result.should.have.nested.property("msg.data[0].id").not.eq(null)
                    doHaveSneakerID = true
                    sneakerUpdateID = result.msg.data[0].id
                    done()
                })
        })

        /**
         * Test add new sneaker
         */
         it("POST /updatedata/addsneaker one more", (done) => {

            if(!doHaveUserID){
                throw console.error("UserID is not existed!!!");
            }

            chai.request(server)
                .post('/updatedata/addsneaker')
                .set('authorization', `Bearer ${accessToken}` )
                .send({"userID": userTestingID, "newSneaker": JSON.stringify(dataTest.addNewSneakerDataTest)})
                .end(function(err,response) {
                    response.should.have.status(200)

                    const result = JSON.parse(response.body)
                    result.should.have.property('success').eq(true)
                    result.should.have.nested.property("msg.data").length.not.eq(0)
                    done()
                })
        })

        /**
         * Test get sneakers
         */
         it("GET /getdata/sneaker", (done) => {
            
            chai.request(server)
                .get('/getdata/sneaker')
                .set('authorization', `Bearer ${accessToken}` )
                .end(function(error,res) {
                    res.should.have.status(200)

                    const result = JSON.parse(res.body)
                    result.should.have.property("success").eq(true)
                    done()
                })
        })

        /**
         * Test update sneakers
         */
        it("POST /updatedata/updatesneaker", (done) => {
            if(!doHaveUserID){
                throw console.error("UserID is not existed!!!");
            }

            if(!doHaveSneakerID){
                throw console.error("sneakerID is not found!!!")
            }

            chai.request(server)
                .post('/updatedata/updatesneaker')
                .set('authorization', `Bearer ${accessToken}` )
                .send({
                    'userID': userTestingID,
                    'sneakerID': sneakerUpdateID,
                    'updateStockInfo': JSON.stringify(dataTest.updateSneakerDataTest)
                })
                .end(function(err, res) {
                    res.should.have.status(200)

                    const result = JSON.parse(res.body)
                    result.should.have.property('success').eq(true)
                    done()
                })
        })


        /**
         * Test delete sneakers
         */
         it("POST /updatedata/removesneaker", (done) => {
            if(!doHaveUserID){
                throw console.error("UserID is not existed!!!");
            }

            if(!doHaveSneakerID){
                throw console.error("sneakerID is not found!!!")
            }

            chai.request(server)
                .post('/updatedata/removesneaker')
                .set('authorization', `Bearer ${accessToken}` )
                .send({
                    'userID': userTestingID,
                    'sneakerID': sneakerUpdateID,
                })
                .end(function(err, res) {
                    res.should.have.status(200)

                    const result = JSON.parse(res.body)
                    result.should.have.property('success').eq(true)
                    done()
                })
        })

        /**
         * Test refresh expired access token
         */
        it("POST /token ", (done) => {
            if(!doHaveUserID){
                throw console.error("UserID is not existed!!!");
            }
            
            chai.request(server)
                .post('/token')
                .send({
                    "userID": userTestingID
                })
                .end(function(err,response) {
                    response.should.have.status(200)

                    let result = JSON.parse(response.body)
                    result.should.have.property('success').eq(true)
                    // result.should.have.property('token').not.eq(null)
                    done()
                }) 

        })

        /**
         * Test log out & delete refresh token
         */
         it("DELETE /logout ", (done) => {
            if(!doHaveUserID){
                throw console.error("UserID is not existed!!!");
            }
            
            chai.request(server)
                .delete('/logout')
                .send({
                    "userID": userTestingID
                })
                .end(function(err,response) {
                    response.should.have.status(200)

                    let result = JSON.parse(response.body)
                    result.should.have.property('success').eq(true)
                    // result.should.have.property('token').not.eq(null)
                    done()
                }) 

        })
    })

    

    

    

    

})