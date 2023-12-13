let accessTokenData = null;

async function getStats() {
  const credentials = getCredentials();

  if (!credentials) {
    document.getElementById('login-form').style.display = 'block';
    return;
  }

  document.getElementById('login-form').style.display = 'none';
  document.getElementById('loading').style.display = 'block';

  const stats = await getContainers(credentials);

  document.getElementById('loading').style.display = 'none';
  showStats(stats);
}

function getCredentials() {
  if (
    !localStorage.getItem('username') ||
    !localStorage.getItem('password') ||
    !localStorage.getItem('url')
  ) {
    return null;
  }

  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const url = localStorage.getItem('url');
  return { username, password, url };
}

function saveCredentials() {
  const apiUrlInput = document.getElementById('api-url');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  const apiUrl = apiUrlInput.value;
  const username = usernameInput.value;
  const password = passwordInput.value;

  localStorage.setItem('username', username);
  localStorage.setItem('password', password);
  localStorage.setItem('url', apiUrl);

  getStats();
}

async function login(credentials) {
  try {
    if (
      accessTokenData &&
      Date.now() - accessTokenData.timestamp < 10 * 60 * 1000
    ) {
      return accessTokenData.token;
    }

    const response = await fetch(credentials.url + '/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed login: ' + response.statusText);
    }

    const data = await response.json();

    accessTokenData = {
      token: data.jwt,
      timestamp: Date.now(),
    };

    return data.jwt;
  } catch (error) {
    console.error('Error during login:', error.message);
    throw error;
  }
}

async function getContainers(credentials) {
  try {
    const url = `${credentials.url}/api/endpoints`;

    const accessToken = await login(credentials);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get containers: ' + response.statusText);
    }

    const data = await response.json();
    console.log('Containers:', data);
    return data;
  } catch (error) {
    console.error('Error getting containers:', error.message);
    throw error;
  }
}

function showStats(data) {
  document.getElementById('result').style.display = 'block';
  const containerData = data[0].Snapshots[0].DockerSnapshotRaw.Containers;
  const displayContainer = document.getElementById('result-data');

  containerData.forEach((container) => {
    displayContainer.innerHTML += `
    <div>
        <p>${container.Names[0].split('/')[1]} (${container.Image})</p>
        <p>${container.State} (${container.Status})</p>
    </div>
    `;
  });
}

getStats();
