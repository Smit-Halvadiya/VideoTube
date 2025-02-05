class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something Went Wronge",
        errors = [],
        stack = "",
    ){
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.data = null
        this.errors = message
        this.success = false

        if(stack){
            this.statck = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
            
        }
    }
}

export {ApiError}