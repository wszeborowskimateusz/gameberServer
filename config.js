const serwerUrl = 'http://localhost:3000';

module.exports = {
    dbConnectionString: 'mongodb://localhost:27017,localhost:27018,localhost:27019/gameber?replicaSet=rs',
    dbPath: 'database/database',

    jwtSecret: 'be7bf361143bdf3c4fae102ad46e303d784910b3',
    serwerUrl: serwerUrl,
    imagesUrl: serwerUrl + '/images/',
    newLevelPower: 1.05,
    loginStreakCoinsMultiplier: 2,
    loginStreakExperienceMultiplier: 2,
    
    defaultAvatarName: "Podstawowy",
    defaultBackgroundName: "Podstawowy"
};
