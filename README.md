# Al Matar Exercise

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
docker-compose up
```
###
> If port 3000 already taken, try to change the env variable `SERVER_PORT` and rerun the previous command
###

#### Run the tests
```
docker exec -t almatar_loyalty_app npm run test
```


## API End-Points

#### You can find API documentations on this end-point

```
{localhost:3000}/api-docs/
```


