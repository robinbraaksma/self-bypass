const request = require('request').defaults({jar: true});

request('https://canva.com', {}, (err, res, body) => {
    if (err) { return console.log(err); }

    if (isChallengeRequest(res, body)) {
        console.log("Yesssssssssss!")

        resp = challengeResponse(res, body);
    } else {
        console.log("No....!")
    }

    // console.log(body)
});


function isChallengeRequest(res, body) {
    if (isFirewallBlocked(res, body)) {
        console.log("===== isFirewallBlocked =====");
        console.log("Cloudflare has blocked this request (Code 1020 Detected).");
    }

    if (isNewCaptchaChallenge(res, body)) {
        console.log("===== isNewCaptchaChallenge =====");
        console.log("Detected a Cloudflare version 2 Captcha challenge, This feature is not available in the opensource (free) version.");
    }

    if (isNewIUAMChallenge(res, body)) {
        console.log("===== isNewIUAMChallenge =====");
        console.log("Detected a Cloudflare version 2 challenge, This feature is not available in the opensource (free) version.");
    }

    if (isCaptchaChallenge(res, body) || isIUAMChallenge(res, body)) {
        console.log("===== isCaptchaChallenge || isIUAMChallenge =====");
        console.log("Detected a Cloudflare version 1 challenge.");
        return true;
    }

    return false;
}

function isFirewallBlocked(res, body) {
    return res.headers.server.startsWith("cloudflare") && res.statusCode == 403 && body.match(/<span class="cf-error-code">1020<\/span>/g);
}

function isNewCaptchaChallenge(res, body) {
    return false
}

function isNewIUAMChallenge(res, body) {
    return false
}

function isCaptchaChallenge(res, body) {
    return res.headers.server.startsWith("cloudflare") && res.statusCode == 403 && body.match(/action="\/\S+__cf_chl_captcha_tk__=\S+/g);
}

function isIUAMChallenge(res, body) {
    return res.headers.server.startsWith("cloudflare") && [429, 503].includes(res.statusCode) && body.match(/<form .*?="challenge-form" action="\/.*?__cf_chl_jschl_tk__=\S+"/g);
}

function challengeResponse(res, body) {
    if (isCaptchaChallenge(res, body)) {
        console.log("===== Captcha Challenge =====");
        request('https://canva.com', {}, (err, res, body) => {
            if (err) { return console.log(err); }

            if (isChallengeRequest(res, body)) {
                console.log("Yesssssssssss!")

                resp = challengeResponse(res, body);
            } else {
                console.log("No....!")
            }

            // console.log(body)
        });
    } else {
        delay = body.match(/submit\(\);\r?\n\s*},\s*([0-9]+)/g)
        console.log(delay);
        return false;
    }
}