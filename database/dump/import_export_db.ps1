﻿Add-Type -AssemblyName System.Windows.Forms

$ip = "localhost"
$port = "27017"
$db = "gameber"

#small letters and plural
$collections = @(
    "users",
    "availablecountries",
    "countries",
    "neighbouringcountries",
    "user_avatars",
    "avatars",
    "messages",
    "user_quest",
    "dailyquests",
    "friendships",
    "backgroundimages",
    "user_images",
    "achievements",
    "abstractcategories",
    "user_achievements",
    "categories",
    "games",
    "experiences")

$importOrExport = Read-Host "Export[e], Import[i]"

foreach ($collection in $collections) {    
    if ($importOrExport -match "[eE]"){
        echo "./export_${db}/${collection}.json"
        mongoexport /h "${ip}:${port}" /d $db /c $collection /o "./export_${db}/${collection}.json" --pretty 
    }
    elseif ($importOrExport -match "[iI]"){
        echo "./import_${db}/${collection}.json"
        mongoimport /h "${ip}:${port}" /d $db /c $collection /file "./import_${db}/${collection}.json"
    }
    else {break}
}

[System.Windows.Forms.MessageBox]::Show("The End")