const serwerUrl = 'http://localhost:3000';

module.exports = {
    dbConnectionString: 'mongodb://localhost/gameber',
    dbPath: 'database/database',

    jwtSecret: 'be7bf361143bdf3c4fae102ad46e303d784910b3',
    serwerUrl: serwerUrl,
    imagesUrl: serwerUrl + '/images/',
    newLevelPower: 1.05
};
