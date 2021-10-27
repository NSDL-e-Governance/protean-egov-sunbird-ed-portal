const proxyUtils = require('../proxy/proxyUtils.js')
const envHelper = require('../helpers/environmentVariablesHelper.js')
const learnerURL = envHelper.LEARNER_URL
const proxy = require('express-http-proxy')
const reqDataLimitOfContentUpload = '50mb'
const isAPIWhitelisted = require('../helpers/apiWhiteList');

module.exports = function (app) {
    app.get('/learner/notification/v1/feed/read/:userId', proxyObject());
    app.get('/learner/notification/v1/feed/delete', proxyObject()),
    app.get('/learner/notification/v1/feed/update', proxyObject())
}
function proxyObject() {
    isAPIWhitelisted.isAllowed()
    return proxy(learnerURL, {
        limit: reqDataLimitOfContentUpload,
        proxyReqOptDecorator: addHeaders(),
        proxyReqPathResolver: function (req) {
            let urlParam = req.path.replace('/learner/', '')
            let query = require('url').parse(req.url).query
            if (query) {
                return require('url').parse(learnerURL + urlParam + '?' + query).path
            } else {
                return require('url').parse(learnerURL + urlParam).path
            }
        },
        userResDecorator: function (proxyRes, proxyResData, req, res) {
            let resData = proxyResData.toString('utf8');
            try {
                let data = JSON.parse(resData);
                if (req.method === 'GET' && proxyRes.statusCode === 404 && (typeof data.message === 'string' && data.message.toLowerCase() === 'API not found with these values'.toLowerCase())) res.redirect('/')
                else return proxyUtils.handleSessionExpiry(proxyRes, data, req, res, data);
            } catch (err) {
                console.log('error', err);
                return proxyUtils.handleSessionExpiry(proxyRes, proxyResData, req, res);
            }
        }
    });
} 
function addHeaders() {
    return function (proxyReqOpts, srcReq) { 
        proxyReqOpts.headers['content-type'] = 'text/plain';
        return proxyReqOpts;
    }
}