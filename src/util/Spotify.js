const clientId = 'USE_YOUR_CLIENT_ID';
const clientSecret = 'USE_YOUR_CLIENT_SECRET';
const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
const apiAuthUrl = 'https://accounts.spotify.com/';
const apiUrl = 'https://api.spotify.com/v1/';
let accessToken;
let refreshToken;
let expiresIn;

const Spotify = {
    async getAccessToken() {
      // This looks very tricky: https://developer.spotify.com/web-api/tutorial/
      // https://github.com/spotify/web-api-auth-examples/blob/master/authorization_code/app.js

      // TODO: Finish the full OAUATH2 exchange throug this process

      console.log('getAccessToken');

      // If we already have a token, simply return
      if(accessToken) {
        return new Promise(resolve => {resolve(accessToken)});
      }

      // If we have just received a response from a successful login, use the new token
      if (window.location.href.match(/access_token=([^&]*)/) &&
          window.location.href.match(/expires_in=([^&]*)/)) {
            console.log('Parsing URL');
            accessToken = window.location.href.match(/access_token=([^&]*)/)[0].split('=')[1];
            expiresIn = window.location.href.match(/expires_in=([^&]*)/)[0].split('=')[1];
            console.log('Token: ' + accessToken);
            console.log('Expires: ' + expiresIn);

            // Make sure we don't attempt to use an expired token
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');

            return new Promise(resolve => {resolve(accessToken)});
        }

        // If we need to get a token, use User Authorization
        await this.getUserAuthorization();

/*
      // API Authorization Guide: https://developer.spotify.com/web-api/authorization-guide/
      // Requires this special format for the client id + secret
      const requestUrl = corsAnywhereUrl + apiAuthUrl + 'api/token';

      // Using this example: https://github.com/spotify/web-api-auth-examples/blob/master/client_credentials/app.js#L19
      let authKey = (new Buffer(clientId + ':' + clientSecret).toString('base64'));

      // Authorization request for the App itself
      let response = await fetch(requestUrl,
      {method: 'POST',
       headers: {'Authorization': 'Basic ' + authKey,
                  'Content-Type':'application/x-www-form-urlencoded'},
       body: 'grant_type=client_credentials'
      });

      if (response.ok) {
        let jsonResponse = await response.json();
        console.log(jsonResponse);
        accessToken = jsonResponse.access_token;
        refreshToken = jsonResponse.refresh_token;
      }
      else {
        console.log('Error with the auth response!')
        console.log(response);
      }
      */

    },

    async getUserAuthorization() {

      const authorizeUrl = apiAuthUrl + 'authorize';
      const scopePermissions = 'playlist-read-private playlist-modify-public playlist-modify-private';
      // If this redirectURI is changed, the new one must be registered with Spotify:
      // https://stackoverflow.com/questions/32956443/invalid-redirect-uri-on-spotify-auth
      //const redirectURI = 'http://localhost:3000';
      const redirectURI = 'http://f-shade-dev-jamming.surge.sh';
      // TODO: Add the state parameter to avoid a CSRF vulnerability
      const queryParams = encodeURI(`?client_id=${clientId}&response_type=token&scope=${scopePermissions}&redirect_uri=${redirectURI}`);
      // It is important the ? does not get encoded or the URL won't parse correctly
      const requestUrl = authorizeUrl + queryParams;

      //let response = await fetch(requestUrl,
      //                          {method: 'GET',
      //                          headers: {'Content-Type':'application/x-www-form-urlencoded'}
      //                        })

      console.log('Full URL with query string: ' + requestUrl);

      // This replace method seems to be the right way to go, based on info here:
      // https://stackoverflow.com/questions/503093/how-to-redirect-to-another-webpage
      window.location.replace(requestUrl);

    },

    // Search Documentation: https://developer.spotify.com/web-api/search-item/
    async search(keywords) {
      return new Promise(async (resolve, reject) => {
        await this.getAccessToken();
        //await this.getUserAuthorization();

        const encodedKeywords = encodeURI(keywords);
        // The Spotify API lets you search by various criteria, i.e. artist or album
        // This simple app only searches by track, so it is hard-coded here
        const searchType = 'track';

        const searchUrl = apiUrl + 'search';
        const requestUrl = corsAnywhereUrl + searchUrl + `?q=${encodedKeywords}&type=${searchType}`;

        let response = await fetch(requestUrl,
                        {method: 'GET',
                          headers: {'Authorization': `Bearer ${accessToken}`,
                                    'Accept': 'application/json'}
                                  });

        if (response.ok) {
          let jsonResponse = await response.json();

          // Valid response should contain a business
          if (jsonResponse.tracks) {
            resolve(jsonResponse.tracks.items.map(track => {
              return {
                id: track.id,
                songName: track.name,
                artistName: track.artists[0].name,
                albumName: track.album.name,
                uri: track.uri
              }
            }));
          }
          else {
            reject('Request failed, no tracks key!');
          }
        }
      })
    },

    async savePlaylist(name, URIs) {
      return new Promise(async (resolve, reject) => {
        // Make sure valid arguments are provided
        if (!name || !URIs ) {
          reject('Invalid parameters in savePlaylist');
        }

        console.log('Beginning playlist update / save process');

        let token = await this.getAccessToken();
        let profileHeader = {'Authorization': `Bearer ${token}`, 'Accept': 'application/json'};
        let userID;
        let playlistID;

        const profileUrl = apiUrl + 'me';
        let requestUrl = corsAnywhereUrl + profileUrl;

        let response = await fetch(requestUrl, {method: 'GET', headers: profileHeader});

        console.log(response);

        if (response.ok) {
          let jsonResponse = await response.json();

          // Valid response should contain a display name
          if (jsonResponse.display_name) {
            userID = jsonResponse.id;
          }
          else {
            reject('Request failed, no display_name key!');
          }
        }

        const createPlaylistUrl = apiUrl + `users/${userID}/playlists`
        const playlistHeader = {'Authorization': `Bearer ${token}`, 'Accept': 'application/json',
                              'Content-Type': 'application/json'};
        const createPlaylistBody = JSON.stringify({'name': name});
        requestUrl = corsAnywhereUrl + createPlaylistUrl;

        response = await fetch(requestUrl, {method: 'POST', headers: playlistHeader, body: createPlaylistBody});

        console.log(response);

        if (response.ok) {
          let jsonResponse = await response.json();

          // Valid response should contain a public indicator
          if (jsonResponse.public) {
            playlistID = jsonResponse.id;
          }
          else {
            reject('Request failed, no public key!');
          }
        }

        const updatePlaylistUrl = apiUrl + `users/${userID}/playlists/${playlistID}/tracks`
        const updatePlaylistBody = JSON.stringify({'uris': URIs});
        requestUrl = corsAnywhereUrl + updatePlaylistUrl;

        response = await fetch(requestUrl, {method: 'POST', headers: playlistHeader, body: updatePlaylistBody});

        console.log(response);

        if (response.ok) {
          let jsonResponse = await response.json();

          // Valid response should contain a public indicator
          if (!jsonResponse.snapshot_id) {
            reject('Request failed, no snapshot_id key!');
          }
        }

        resolve('Playlist Saved');
      })
    }
};

export default Spotify;
