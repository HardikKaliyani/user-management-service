# user-management-service

# How to start service
- Clone repository to your system :
-   git clone https://github.com/HardikKaliyani/user-management-service.git
-   cd user-management-service
- After that to start the application, you just need to run the Docker Compose file. Make sure Docker and Docker Compose are installed on your system.

- Run the following command:
  docker-compose -f docker-compose.dev.yml up -d

- Both the database and the app server will now be running. You can call any API using the default server port 3000.
- Wait some time till "Server started on port 3000 in development mode" this response not received it may be some error of dependecy ocurred but wait automatically server will start in few minutes 
- Notes:
  - Due to time constraints, test cases are not included. However, all other requirements mentioned in the task description have been completed.
