# storj-cdnproxy

## Setup
```
npm install
```

## Configure
Create a `.env` file in the root directory of the repository. Add your bucket hash and apiKey as follows.

```
NODE_PORT=3033
API_KEY=yourapikeyhere
BUCKET=yourbuckethashhere
KEYPASS=keyringpassword
DATADIR=/path/to/key.ring
```

## Run
Currently to start, run the following...

```
node index.js
```

## Usage
To access files via hash in the bucket configured, use something similar to the following
```
https://my-host/getbyid/[yourfileid]
```
