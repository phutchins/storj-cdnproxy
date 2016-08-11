# storj-cdnproxy

## Requirements
Currently this app has been tested using NodeJS v5.11.1 but should work on other versions as well.

## Setup
```
npm install
npm run build
```

## Configure
Create a `.env` file in the root directory of the repository. Add your bucket hash and apiKey as follows.

```
NODE_PORT=3033
BS_PORT=8888
BS_EXT_PORT=9000
BUCKET=yourbuckethashhere
KEYPASS=keyringpassword
BRIDGEEMAIL=yourbridgeemail
BRIDGEPASS=yourbridgepassword
DATADIR=/home/user/.storjcli/
```

## Run
Currently to start, run the following...

```
node index.js
```

## Usage

### Get File by ID
To access files via ID...
```
https://my-host/getbyid/[yourfileid]
```

### Get File by Name
To access files via name...
```
https://my-host/getbyname/[yourfilename]
```

### Upload Files & Get Links
To drag and drop upload files, and to view the file list with links...
```
https://my-host/upload
```

## Known Issues
+ After uploading a file, you currently are required to refresh the screen manually to get an updated list.
+ The cached file name map does not update after each upload, but it should.
