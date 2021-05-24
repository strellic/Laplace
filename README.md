# Laplace
![](https://i.imgur.com/PdthHrv.png)

Laplace is a web-based learning and coding platform for both students and teachers alike!

Teachers can create rooms filled with coding challenges, mini-quizzes, interactive games, and more to send to students.
These students can program and build in a variety of different programming languages all from their browser!

## Features
* Interactive Code IDE
* File upload & storage
* Support for programming test cases & style checks
* Custom questions
* Support for custom JavaScript apps for interactive games
* Rooms with progress checks that you complete to progress
* Built-in support for real-time code collaboration
* Easy-to-use room creation editor
* Profile system with nicknames and bio
* And more!

## Screenshots
![](https://i.imgur.com/3dY8jCD.jpg)
![](https://i.imgur.com/EGfzETA.png)
![](https://i.imgur.com/xg9yUF9.png)
![](https://i.imgur.com/PQa1e6L.png)
![](https://i.imgur.com/d54zHAU.png)
![](https://i.imgur.com/hhZ4COv.png)

## Setup
Laplace utilizes Docker containers to safely execute untrusted code. You need to pull the correct images so that this functionality works correctly. Make sure the user you both run the following commands and run Laplace as is `root`, or is in the `docker` group!

Run the following setup commands to pull the necessary Docker images:
```bash
docker pull stepik/epicbox-gcc:6.3.0
docker pull stepik/epicbox-mono:5.0.0
docker pull stepik/epicbox-mono:5.0.0
docker pull stepik/epicbox-java:11.0.1
docker pull strellic/epicbox-node:latest
docker pull strellic/epicbox-python:latest
docker pull strellic/rust-sandbox:latest
```

After this, you should have downloaded all of the Docker images needed.
From there, follow the setup instructions in each of the folders.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)