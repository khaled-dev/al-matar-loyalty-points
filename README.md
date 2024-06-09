# Al Matar Exercise

## API End-Points

#### You can find The API documentations on this end-point

```
{localhost:3000}/api-docs/
```
----

## THE SETUP

#### Clone and change directory
```
git clone git@github.com:khaled-dev/al-matar-loyalty-points.git

cd al-matar-loyalty-points
```

#### Copy `env` file
```
cp .env.example .env
```

#### Build docker image and run the containers
```
docker-compose up --build
```

> you can change the taken ports by changing their values in the `.env` file,
> and in `src/gonfic/database.json` for migration purposes.


#



#### Run the migrations
```
docker exec -t almatar_loyalty_app npx sequelize-cli db:migrate 
```


> `CronJob`: after running the migrations you can start the coron job by changing the value of `CRONJOB` environmental variable to be `active`,
> only if needed, after that rebuild the application by using `docker-compose up --build`




----
#

## Running the tests

#
#### Run the test migrations
```
docker exec -t almatar_loyalty_app npx sequelize-cli db:migrate 
```

#### Run the test suites

```
docker exec -t almatar_loyalty_app npm run test
```





