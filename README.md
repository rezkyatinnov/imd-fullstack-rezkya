# IMD Global Services - Fullstack Developer Test

this is a test for IMD as Fullstack Developer

## Features
all features are based on User Stories written on Test Doc

* As a user, I need an API to create a friend connection between two email addresses.
* As a user, I need an API to retrieve the friends list for an email address.
* As a user, I need an API to retrieve the common friends list between two email addresses.
* As a user, I need an API to subscribe to updates from an email address.
* As a user, I need an API to block updates from an email address.
* As a user, I need an API to retrieve all email addresses that can receive updates from an email address.

## Run 

make sure your machine is docker ready. \
for docker instalation you can check it [here]()

* for macOS user, check [here](https://docs.docker.com/docker-for-mac/install/)
* for Windows 10 user, check [here](https://docs.docker.com/docker-for-windows/install/)
* for Ubuntu, check [here](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/)


After you installed the docker on your machine, you can go to project root dir and type

```
docker-compose up --build
```
or if it needs admin access, add ``sudo`` to the command
```
sudo docker-compose up --build
```

## Usage

all endpoint documented in postman collection file with file name
```imdfullstackexpress.postman_collection.json```
open that file in your postman client app.

or you can just go to [http://localhost:3000/api-docs](http://localhost:3000/api-docs) to see all the API endpoint documentation and can try it out directly there
