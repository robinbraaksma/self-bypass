const axios = require ('axios');

axios.defaults.withCredentials = true;

axios
  .get ('https://canva.com', {withCredentials: true})
  .then (response => {
    console.log (response);
  })
  .catch (error => {
    if (isChallengeRequest (error.response)) {
      console.log ('Yesssssssssss!');

      resp = challengeResponse (error.response);
    } else {
      console.log ('No....!');
    }
  });

function isChallengeRequest (resp) {
  if (isFirewallBlocked (resp)) {
    console.log ('===== isFirewallBlocked =====');
    console.log ('Cloudflare has blocked this request (Code 1020 Detected).');
  }

  if (isNewCaptchaChallenge (resp)) {
    console.log ('===== isNewCaptchaChallenge =====');
    console.log (
      'Detected a Cloudflare version 2 Captcha challenge, This feature is not available in the opensource (free) version.'
    );
  }

  if (isNewIUAMChallenge (resp)) {
    console.log ('===== isNewIUAMChallenge =====');
    console.log (
      'Detected a Cloudflare version 2 challenge, This feature is not available in the opensource (free) version.'
    );
  }

  if (isCaptchaChallenge (resp) || isIUAMChallenge (resp)) {
    console.log ('===== isCaptchaChallenge || isIUAMChallenge =====');
    console.log ('Detected a Cloudflare version 1 challenge.');
    return true;
  }

  return false;
}

function isFirewallBlocked (res) {
  return (
    res.headers.server.startsWith ('cloudflare') &&
    res.status == 403 &&
    res.data.match (/<span class="cf-error-code">1020<\/span>/g)
  );
}

function isNewCaptchaChallenge (res) {
  return false;
}

function isNewIUAMChallenge (res) {
  return false;
}

function isCaptchaChallenge (res) {
  return (
    res.headers.server.startsWith ('cloudflare') &&
    res.status == 403 &&
    res.data.match (/action="\/\S+__cf_chl_captcha_tk__=\S+/g)
  );
}

function isIUAMChallenge (res) {
  return (
    res.headers.server.startsWith ('cloudflare') &&
    [429, 503].includes (res.status) &&
    res.data.match (
      /<form .*?="challenge-form" action="\/.*?__cf_chl_jschl_tk__=\S+"/g
    )
  );
}

function challengeResponse (res) {
  if (isCaptchaChallenge (res)) {
    axios
      .get ('https://canva.com', {withCredentials: true})
      .then (response => {
        console.log (response);
      })
      .catch (error => {
        if (isChallengeRequest (error.response)) {
          console.log ('Yesssssssssss!');

          resp = challengeResponse (error.response);
        } else {
          console.log ('No....!');
        }
      });
  } else {
    delay = res.data.match (/submit\(\);\r?\n\s*},\s*([0-9]+)/g);
    console.log (delay);
    return false;
  }
}
