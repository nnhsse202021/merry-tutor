## Merry Tutor Web App 
A webapp for the student non-profit Merry Tutor. Allows tutoring session summaries to be submitted, stored, and retrieved by different users of the app. (Board Members, Tutors, Tutees, and Parents will have varying levels of access when using the app.)

## Motivation
Project undertaken for NNHS Software Engineering Class 2020-21. We collaborated with founder Jane Boettcher to replace the less efficient system.

## Tech/framework used
Ex. -

<b>Built with</b>
- [Visual Studio Code](https://code.visualstudio.com/)

<b>Backend built using</b>
- [Express](https://expressjs.com/) & [Node.js](https://nodejs.org/en/)

<b>Data stored in</b>
- [MongoDB](https://www.mongodb.com/)

<b>Frontend build using</b>
- [ejs](https://ejs.co/)
- CSS + JavaScript

## Features
- Variable HTML output from database informaiton via EJS 
- Implements Google OAuth2.0 Login API

## Platform Requirements
The app itself is not specific to one operating system, and can be used cross-platform. Node.js v14.15.4+ is required, as well as
an editing software such as Virtual Studio Code.

## Installation
Visual Studio Code can be installed here: https://code.visualstudio.com/download
Node.js can be installed here: https://nodejs.org/en/download/

## Developmetn Configuration and Running
1. Clone the project repository and open in VSCode
2. Open a terminal window and use "npm i" to install the packages
3. Once packages are installed, use "npm start" to run the application
4. Navigate to localhost:8080 to see the app running in a web browser
5. Use "CTRL + c" to stop the application run

## Production Server Deployment

1. Create a new EC2 instance used on Ubuntu.
2. Open ports for HTTP and HTTPS when walking through the EC2 wizard.
3. Generate a key pair for this EC2 instance. Download and save the private key, which is needed to connect to the instance in the future.
4. After the EC2 instance is running, click on the Connect button the EC2 Management Console for instructions on how to ssh into the instance.
5. On the EC2 instance, install Node.js v14

```
    curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    sudo apt-get install -y nodejs
```

6. On the EC2 instance, install nginx: `sudo apt-get -y install nginx`
7. Create a reverse proxy for the The Merry Tutor node server. In the file /etc/nginx/sites-enabled/themerrytutor:

```
server {
	# listen on port 80 (http)
	listen 80;
	server_name themerrytutor.nnhsse.org;

	# write access and error logs to /var/log
	access_log /var/log/themerrytutor_access.log;
	error_log /var/log/themerrytutor_error.log;

	location / {
		# forward application requests to the node server
		proxy_pass http://localhost:8080;
		proxy_redirect off;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	}
}
```

8. Restart the nginx server: `sudo service nginx reload`
9. Install and configure [certbot](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx)
10. Clone this repository from GitHub.
11. Inside of the directory for this repository install the node dependencies: `npm install`
12. [Install mongoDB locally](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/) using apt.
13. [Secure the installation](https://docs.mongodb.com/guides/server/auth/) of mongoDB.
14. Update /etc/mongod.conf with [security.authorization enabled](https://docs.mongodb.com/manual/reference/configuration-options/#mongodb-setting-security.authorization).
15. Update the .env file:

```
PRODUCTION=TRUE
MONGO_PASSWORD=admin-user-password
```

16. Create the admin user for the merry-tutor database via mongo shell:

```
> use merry-tutor
switched to db merry-tutor
> db.createUser(
...   {
...     user: "admin",
...     pwd: "admin-user-password",
...     roles: ["readWrite", "dbAdmin"]
...   }
... )
```

17. While still in the mongo shell, create the Users and Summaries collections:

```
> use merry-tutor
switched to db merry-tutor
> db.createCollection("Users")
{ "ok" : 1 }
> db.createCollection("Summaries")
{ "ok" : 1 }
```

18. Install Production Manager 2, which is used to keep the node server running and restart it when changes are pushed to master:

```
sudo npm install pm2 -g
sudo pm2 start app.js
```

19. Verify that the node server is running: `sudo pm2 list`
20. Configure pm2 to automatically run when the EC2 instance restarts: `sudo pm2 startup`
21. Add a crontab entry to pull from GitHub every minute: `crontab -e`

```
*/1 * * * * cd /home/ubuntu/merry-tutor && git pull
```

22. Restart the node server: `sudo pm2 restart app`


## Contribute
Pull requests are currently welcome.

## License
TBD

## Credits
[_A Beginners Guide to writing a Kickass README_](https://meakaakka.medium.com/a-beginners-guide-to-writing-a-kickass-readme-7ac01da88ab3)

