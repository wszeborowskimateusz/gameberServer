# gameberServer
Bachelor dissertation. Gameber = game + remember - a game for learning foreign languages.

## database
1. Install run-rs globally 
```
npm install run-rs -g
```
then run run-rs
```
run-rs --mongod --dbpath c:\path_to_mongo_data\dbs -h "localhost" --keep --shell
``` 
### run-rs params
1. Specify --mongod if you dont use env.path for mongo.
```
--mongod .../mongod.exe
```
otherwize just "--mongod" is enough.

2. Specify --dbpath if you dont use a standard localisation of mongo databases
```
--dbpath c:\path_to_mongo_data\dbs
```
3. Use 
```
-h "localhost" --keep --shell
```
