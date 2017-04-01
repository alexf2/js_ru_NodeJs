
const statusMap = new Map([
    [400, 'Bad Request'],
    [403, 'Forbidden'],
    [404, 'Not found'],
    [405, 'Method Not Allowed'],
    [406, 'Not Acceptable'],
    [409, 'Conflict'],
    [411, 'Length Required'],
    [413, 'Payload Too Large'],
    [500, 'Internal Server Error'],
    [501, 'Not Implemented'],
    [503, 'Service Unavailable']
])

const breakResponse = (resp, code, message) => {
    if (!resp.headersSent) {
        resp.statusCode = code
        const statusDescr = statusMap.get(code)
        if (statusDescr)
            resp.statusMessage = statusDescr
    }
    resp.end(message)
}

module.exports = {breakResponse}