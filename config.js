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
    expirationTimeJWT: 900, // seconds
    
    defaultAvatarName: "Podstawowy",
    defaultBackgroundName: "Podstawowy",

    randomCategoryName: "Losowa kategoria",
    randomCategoryImage: "categories/losowaKategoria/losowaKategoria.jpg",
    randomCategoryId: "random_category_id",

    google_client_id: "925243319638-ttosmhr4pf4ada5i37ve5gbsggo5isgm.apps.googleusercontent.com",
    google_client_secret: "dbLc9FzmOLj_uL1ad7jRIeqt",
    google_redirect_url: "http://localhost:8080",
    google_password_appx: "79780aec20a58"
};
