#!/bin/sh
echo "########################## installing unzip/httpd/epelrelease #######################"
yum install epel-release -y
yum install unzip -y
echo "########################## installing docker #######################"
if ! [ -x "$(command -v docker)" ]; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi
echo "########################## installing docker-compose #######################"
curl -L "https://github.com/docker/compose/releases/download/v2.11.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
echo "########################## starting docker #######################"
service docker start
if [ -f .env ]
then
  echo "########################## load .env #######################"
  source ./.env
  echo "########################## login to docker registry #######################"
  echo $GITLAB_TOKEN | docker login  -u abdeljalil.aitetaleb@adsglory.net --password-stdin https://gitlab.wikileadsco.com:5050
  echo "########################## run docker containers #######################"
  docker-compose up -d
  echo "success"
else
  echo ".env file not found"
  exit 1
fi



