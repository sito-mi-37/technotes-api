const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    // we check every req header to see if they have authorizaton with them
    const authHeader = req.headers.authorization || req.headers.Authorization 

    if (!authHeader?.startsWith('Bearer ')){
        return res.status(401).json({message: "Unauthorized"})
    }

    // we grab our token from the authorization header by spliting the string and getting the second item from new array
    const token = authHeader.split(' ')[1]

    // here we verify the token we got 
    // first arguement is the token, second the secret key, third is a callback function 
    // the callback function eithe has an error or a result(decoded in this case)
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            // check for error
            if(err){
                return res.status(403).json({message: "Forbidden"})
            }
            // get our user and role from the token
            req.user = decoded.UserInfo.username 
            req.roles = decoded.UserInfo.roles
            // call the next middleware or if not any go straight to the controller in our endpoin
            next()
        }
    )
}

module.exports = verifyJWT